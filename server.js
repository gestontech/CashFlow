const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const app = express();

const PORT = Number(process.env.PORT || 3000);

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "gestontech@gmail.com"
).trim().toLowerCase();

const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "gestontech@gmail.com";

const SUPPORT_WHATSAPP =
  process.env.SUPPORT_WHATSAPP || "243993030390";

const APP_NAME =
  process.env.APP_NAME || "CashFlow";

const ROOT = __dirname;

const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const AVATAR_DIR = path.join(UPLOAD_DIR, "avatars");
const PUBLIC_DIR = path.join(ROOT, "public");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(AVATAR_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

/* =========================================================
   DATABASE
========================================================= */

const db = new Database(
  path.join(DATA_DIR, "cashflow.db")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT DEFAULT '',
  shop_name TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free',
  role TEXT NOT NULL DEFAULT 'user',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sku TEXT DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  customer_id INTEGER,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  note TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY(customer_id)
    REFERENCES customers(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY(sale_id)
    REFERENCES sales(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  customer_id INTEGER,
  amount REAL NOT NULL,
  paid REAL NOT NULL DEFAULT 0,
  note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY(customer_id)
    REFERENCES customers(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS debt_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debt_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(debt_id)
    REFERENCES debts(id)
    ON DELETE CASCADE
);
`);

/* =========================================================
   ADMIN PRINCIPAL
========================================================= */

const existingAdmin = db
  .prepare("SELECT id FROM users WHERE email = ?")
  .get(ADMIN_EMAIL);

if (existingAdmin) {
  db.prepare(`
    UPDATE users
    SET role = 'admin',
        active = 1
    WHERE id = ?
  `).run(existingAdmin.id);
}

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "CHANGE-ME-IN-PRODUCTION",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 14
    }
  })
);

app.use(
  "/uploads",
  express.static(UPLOAD_DIR)
);

app.use(
  express.static(PUBLIC_DIR)
);

/* =========================================================
   UPLOAD PHOTO
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATAR_DIR);
  },

  filename: (req, file, cb) => {
    const ext =
      path.extname(file.originalname)
        .toLowerCase();

    cb(
      null,
      `${req.session.userId}-${Date.now()}${ext}`
    );
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (
      /^image\/(jpeg|png|webp)$/.test(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Format accepté : JPG, PNG ou WebP."
        )
      );
    }
  }
});

/* =========================================================
   HELPERS
========================================================= */

function getUserById(id) {
  if (!id) return null;

  return db
    .prepare(
      "SELECT * FROM users WHERE id = ?"
    )
    .get(id);
}

function publicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    shop_name: user.shop_name,
    avatar: user.avatar,
    plan: user.plan,
    role: user.role,
    active: Boolean(user.active),
    created_at: user.created_at
  };
}

function requireAuth(req, res, next) {
  const currentUser = getUserById(
    req.session.userId
  );

  if (
    !currentUser ||
    !currentUser.active
  ) {
    return res.status(401).json({
      error: "AUTH_REQUIRED"
    });
  }

  req.user = currentUser;

  next();
}

function requireAdmin(req, res, next) {
  const currentUser = getUserById(
    req.session.userId
  );

  if (
    !currentUser ||
    !currentUser.active
  ) {
    return res.status(401).json({
      error: "AUTH_REQUIRED"
    });
  }

  if (
    currentUser.role !== "admin" ||
    currentUser.email.toLowerCase() !==
      ADMIN_EMAIL
  ) {
    return res.status(403).json({
      error: "ADMIN_ONLY"
    });
  }

  req.user = currentUser;

  next();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function planLimits(plan) {
  if (plan === "free") {
    return {
      products: 30,
      customers: 20
    };
  }

  return {
    products: Infinity,
    customers: Infinity
  };
}

function removeAvatar(avatar) {
  if (
    !avatar ||
    !avatar.startsWith(
      "/uploads/avatars/"
    )
  ) {
    return;
  }

  const filePath = path.join(
    ROOT,
    avatar.substring(1)
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

/* =========================================================
   CONFIG
========================================================= */

app.get("/api/config", (req, res) => {
  res.json({
    appName: APP_NAME,
    supportEmail: SUPPORT_EMAIL,
    supportWhatsapp: SUPPORT_WHATSAPP,
    adminEmail: ADMIN_EMAIL
  });
});

/* =========================================================
   AUTH - REGISTER
========================================================= */

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const name = String(
        req.body.name || ""
      ).trim();

      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      const password = String(
        req.body.password || ""
      );

      const phone = String(
        req.body.phone || ""
      ).trim();

      const shopName = String(
        req.body.shop_name || ""
      ).trim();

      if (name.length < 2) {
        return res.status(400).json({
          error: "Nom invalide."
        });
      }

      if (!validEmail(email)) {
        return res.status(400).json({
          error: "Adresse e-mail invalide."
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error:
            "Le mot de passe doit contenir au moins 8 caractères."
        });
      }

      const existing = db
        .prepare(
          "SELECT id FROM users WHERE email = ?"
        )
        .get(email);

      if (existing) {
        return res.status(409).json({
          error:
            "Cette adresse e-mail est déjà utilisée."
        });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const role =
        email === ADMIN_EMAIL
          ? "admin"
          : "user";

      const result = db
        .prepare(`
          INSERT INTO users
          (
            name,
            email,
            password_hash,
            phone,
            shop_name,
            role
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          name,
          email,
          passwordHash,
          phone,
          shopName,
          role
        );

      req.session.userId =
        result.lastInsertRowid;

      res.json({
        ok: true,
        user: publicUser(
          getUserById(
            result.lastInsertRowid
          )
        )
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Impossible de créer le compte."
      });
    }
  }
);

/* =========================================================
   AUTH - LOGIN
========================================================= */

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      const password = String(
        req.body.password || ""
      );

      const user = db
        .prepare(
          "SELECT * FROM users WHERE email = ?"
        )
        .get(email);

      if (
        !user ||
        !(await bcrypt.compare(
          password,
          user.password_hash
        ))
      ) {
        return res.status(401).json({
          error:
            "E-mail ou mot de passe incorrect."
        });
      }

      if (!user.active) {
        return res.status(403).json({
          error:
            "Ce compte est désactivé."
        });
      }

      if (email === ADMIN_EMAIL) {
        db.prepare(`
          UPDATE users
          SET role = 'admin'
          WHERE id = ?
        `).run(user.id);
      }

      req.session.userId = user.id;

      res.json({
        ok: true,
        user: publicUser(
          getUserById(user.id)
        )
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Erreur de connexion."
      });
    }
  }
);

/* =========================================================
   AUTH - ME
========================================================= */

app.get(
  "/api/auth/me",
  (req, res) => {
    const user = getUserById(
      req.session.userId
    );

    res.json({
      user: publicUser(user)
    });
  }
);

/* =========================================================
   AUTH - LOGOUT
========================================================= */

app.post(
  "/api/auth/logout",
  (req, res) => {
    req.session.destroy(() => {
      res.json({
        ok: true
      });
    });
  }
);

/* =========================================================
   PROFILE
========================================================= */

app.put(
  "/api/profile",
  requireAuth,
  (req, res) => {
    const name = String(
      req.body.name || ""
    ).trim();

    if (name.length < 2) {
      return res.status(400).json({
        error: "Nom invalide."
      });
    }

    db.prepare(`
      UPDATE users
      SET
        name = ?,
        phone = ?,
        shop_name = ?
      WHERE id = ?
    `).run(
      name,
      String(req.body.phone || "").trim(),
      String(
        req.body.shop_name || ""
      ).trim(),
      req.user.id
    );

    res.json({
      ok: true,
      user: publicUser(
        getUserById(req.user.id)
      )
    });
  }
);

/* =========================================================
   PROFILE AVATAR
========================================================= */

app.post(
  "/api/profile/avatar",
  requireAuth,
  (req, res) => {
    upload.single("avatar")(
      req,
      res,
      error => {
        if (error) {
          return res.status(400).json({
            error:
              error.message ||
              "Image invalide."
          });
        }

        if (!req.file) {
          return res.status(400).json({
            error:
              "Veuillez sélectionner une image."
          });
        }

        removeAvatar(req.user.avatar);

        const avatar =
          `/uploads/avatars/${req.file.filename}`;

        db.prepare(`
          UPDATE users
          SET avatar = ?
          WHERE id = ?
        `).run(
          avatar,
          req.user.id
        );

        res.json({
          ok: true,
          user: publicUser(
            getUserById(req.user.id)
          )
        });
      }
    );
  }
);

/* =========================================================
   DELETE ACCOUNT
========================================================= */

app.delete(
  "/api/account",
  requireAuth,
  async (req, res) => {
    const password = String(
      req.body.password || ""
    );

    const valid =
      await bcrypt.compare(
        password,
        req.user.password_hash
      );

    if (!valid) {
      return res.status(401).json({
        error:
          "Mot de passe incorrect."
      });
    }

    removeAvatar(
      req.user.avatar
    );

    db.prepare(
      "DELETE FROM users WHERE id = ?"
    ).run(req.user.id);

    req.session.destroy(() => {
      res.json({
        ok: true
      });
    });
  }
);

/* =========================================================
   DASHBOARD
========================================================= */

app.get(
  "/api/dashboard",
  requireAuth,
  (req, res) => {
    const id = req.user.id;

    const today = db
      .prepare(`
        SELECT
          COALESCE(SUM(total), 0) AS total,
          COUNT(*) AS count
        FROM sales
        WHERE user_id = ?
        AND date(created_at)
          = date('now','localtime')
      `)
      .get(id);

    const month = db
      .prepare(`
        SELECT
          COALESCE(SUM(total), 0) AS total,
          COUNT(*) AS count
        FROM sales
        WHERE user_id = ?
        AND strftime(
          '%Y-%m',
          created_at
        )
        =
        strftime(
          '%Y-%m',
          'now',
          'localtime'
        )
      `)
      .get(id);

    const stock = db
      .prepare(`
        SELECT
          COUNT(*) AS products,
          COALESCE(
            SUM(stock),
            0
          ) AS units,
          COALESCE(
            SUM(
              CASE
                WHEN stock <= min_stock
                THEN 1
                ELSE 0
              END
            ),
            0
          ) AS low
        FROM products
        WHERE user_id = ?
      `)
      .get(id);

    const debt = db
      .prepare(`
        SELECT
          COALESCE(
            SUM(amount - paid),
            0
          ) AS amount
        FROM debts
        WHERE user_id = ?
        AND status != 'paid'
      `)
      .get(id);

    const recent = db
      .prepare(`
        SELECT
          id,
          total,
          payment_method,
          created_at
        FROM sales
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 8
      `)
      .all(id);

    res.json({
      today,
      month,
      stock,
      debt,
      recent,
      user: publicUser(req.user)
    });
  }
);

/* =========================================================
   PRODUCTS
========================================================= */

app.get(
  "/api/products",
  requireAuth,
  (req, res) => {
    res.json(
      db
        .prepare(`
          SELECT *
          FROM products
          WHERE user_id = ?
          ORDER BY id DESC
        `)
        .all(req.user.id)
    );
  }
);

app.post(
  "/api/products",
  requireAuth,
  (req, res) => {
    const limits =
      planLimits(req.user.plan);

    const count = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM products
        WHERE user_id = ?
      `)
      .get(req.user.id)
      .count;

    if (count >= limits.products) {
      return res.status(403).json({
        error:
          "La limite du plan Gratuit est atteinte. Passez à Pro ou Élite."
      });
    }

    const name = String(
      req.body.name || ""
    ).trim();

    const price = Number(
      req.body.price || 0
    );

    const stock = Number(
      req.body.stock || 0
    );

    const minStock = Number(
      req.body.min_stock || 0
    );

    if (
      !name ||
      price < 0 ||
      stock < 0 ||
      minStock < 0
    ) {
      return res.status(400).json({
        error:
          "Données produit invalides."
      });
    }

    const result = db
      .prepare(`
        INSERT INTO products
        (
          user_id,
          name,
          sku,
          price,
          stock,
          min_stock
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        req.user.id,
        name,
        String(
          req.body.sku || ""
        ).trim(),
        price,
        stock,
        minStock
      );

    res.json(
      db
        .prepare(
          "SELECT * FROM products WHERE id = ?"
        )
        .get(result.lastInsertRowid)
    );
  }
);

app.put(
  "/api/products/:id",
  requireAuth,
  (req, res) => {
    const product = db
      .prepare(`
        SELECT *
        FROM products
        WHERE id = ?
        AND user_id = ?
      `)
      .get(
        req.params.id,
        req.user.id
      );

    if (!product) {
      return res.status(404).json({
        error:
          "Produit introuvable."
      });
    }

    const name = String(
      req.body.name || ""
    ).trim();

    const price = Number(
      req.body.price
    );

    const stock = Number(
      req.body.stock
    );

    const minStock = Number(
      req.body.min_stock
    );

    if (
      !name ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(minStock) ||
      minStock < 0
    ) {
      return res.status(400).json({
        error:
          "Données produit invalides."
      });
    }

    db.prepare(`
      UPDATE products
      SET
        name = ?,
        sku = ?,
        price = ?,
        stock = ?,
        min_stock = ?
      WHERE id = ?
    `).run(
      name,
      String(
        req.body.sku || ""
      ).trim(),
      price,
      stock,
      minStock,
      product.id
    );

    res.json(
      db
        .prepare(
          "SELECT * FROM products WHERE id = ?"
        )
        .get(product.id)
    );
  }
);

app.delete(
  "/api/products/:id",
  requireAuth,
  (req, res) => {
    db.prepare(`
      DELETE FROM products
      WHERE id = ?
      AND user_id = ?
    `).run(
      req.params.id,
      req.user.id
    );

    res.json({
      ok: true
    });
  }
);

/* =========================================================
   CUSTOMERS
========================================================= */

app.get(
  "/api/customers",
  requireAuth,
  (req, res) => {
    res.json(
      db
        .prepare(`
          SELECT *
          FROM customers
          WHERE user_id = ?
          ORDER BY id DESC
        `)
        .all(req.user.id)
    );
  }
);

app.post(
  "/api/customers",
  requireAuth,
  (req, res) => {
    const limits =
      planLimits(req.user.plan);

    const count = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM customers
        WHERE user_id = ?
      `)
      .get(req.user.id)
      .count;

    if (count >= limits.customers) {
      return res.status(403).json({
        error:
          "La limite du plan Gratuit est atteinte. Passez à Pro ou Élite."
      });
    }

    const name = String(
      req.body.name || ""
    ).trim();

    const phone = String(
      req.body.phone || ""
    ).trim();

    const email = String(
      req.body.email || ""
    ).trim();

    if (name.length < 2) {
      return res.status(400).json({
        error:
          "Le nom du client est requis."
      });
    }

    if (
      email &&
      !validEmail(email)
    ) {
      return res.status(400).json({
        error:
          "Adresse e-mail du client invalide."
      });
    }

    const result = db
      .prepare(`
        INSERT INTO customers
        (
          user_id,
          name,
          phone,
          email
        )
        VALUES (?, ?, ?, ?)
      `)
      .run(
        req.user.id,
        name,
        phone,
        email
      );

    res.json(
      db
        .prepare(
          "SELECT * FROM customers WHERE id = ?"
        )
        .get(result.lastInsertRowid)
    );
  }
);

/* =========================================================
   CUSTOMER - UPDATE
========================================================= */

app.put(
  "/api/customers/:id",
  requireAuth,
  (req, res) => {
    const customer = db
      .prepare(`
        SELECT *
        FROM customers
        WHERE id = ?
        AND user_id = ?
      `)
      .get(
        req.params.id,
        req.user.id
      );

    if (!customer) {
      return res.status(404).json({
        error:
          "Client introuvable."
      });
    }

    const name = String(
      req.body.name || ""
    ).trim();

    const phone = String(
      req.body.phone || ""
    ).trim();

    const email = String(
      req.body.email || ""
    ).trim();

    if (name.length < 2) {
      return res.status(400).json({
        error:
          "Le nom du client est requis."
      });
    }

    if (
      email &&
      !validEmail(email)
    ) {
      return res.status(400).json({
        error:
          "Adresse e-mail du client invalide."
      });
    }

    db.prepare(`
      UPDATE customers
      SET
        name = ?,
        phone = ?,
        email = ?
      WHERE id = ?
      AND user_id = ?
    `).run(
      name,
      phone,
      email,
      customer.id,
      req.user.id
    );

    res.json(
      db
        .prepare(
          "SELECT * FROM customers WHERE id = ?"
        )
        .get(customer.id)
    );
  }
);

app.delete(
  "/api/customers/:id",
  requireAuth,
  (req, res) => {
    db.prepare(`
      DELETE FROM customers
      WHERE id = ?
      AND user_id = ?
    `).run(
      req.params.id,
      req.user.id
    );

    res.json({
      ok: true
    });
  }
);

/* =========================================================
   SALES
========================================================= */

app.get(
  "/api/sales",
  requireAuth,
  (req, res) => {
    res.json(
      db
        .prepare(`
          SELECT
            s.*,
            c.name AS customer_name
          FROM sales s
          LEFT JOIN customers c
            ON c.id = s.customer_id
          WHERE s.user_id = ?
          ORDER BY s.id DESC
          LIMIT 200
        `)
        .all(req.user.id)
    );
  }
);

app.get(
  "/api/sales/:id",
  requireAuth,
  (req, res) => {
    const sale = db
      .prepare(`
        SELECT *
        FROM sales
        WHERE id = ?
        AND user_id = ?
      `)
      .get(
        req.params.id,
        req.user.id
      );

    if (!sale) {
      return res.status(404).json({
        error:
          "Vente introuvable."
      });
    }

    const items = db
      .prepare(`
        SELECT *
        FROM sale_items
        WHERE sale_id = ?
        ORDER BY id
      `)
      .all(sale.id);

    res.json({
      sale,
      items
    });
  }
);

app.post(
  "/api/sales",
  requireAuth,
  (req, res) => {
    const items = Array.isArray(
      req.body.items
    )
      ? req.body.items
      : [];

    if (!items.length) {
      return res.status(400).json({
        error:
          "Ajoutez au moins un produit."
      });
    }

    try {
      const transaction =
        db.transaction(() => {
          let total = 0;

          const preparedItems = [];

          for (const item of items) {
            const product = db
              .prepare(`
                SELECT *
                FROM products
                WHERE id = ?
                AND user_id = ?
              `)
              .get(
                Number(
                  item.product_id
                ),
                req.user.id
              );

            const quantity = Number(
              item.quantity
            );

            if (
              !product ||
              !Number.isInteger(
                quantity
              ) ||
              quantity <= 0
            ) {
              throw new Error(
                "Produit ou quantité invalide."
              );
            }

            if (
              product.stock <
              quantity
            ) {
              throw new Error(
                `Stock insuffisant pour ${product.name}.`
              );
            }

            const subtotal =
              product.price *
              quantity;

            total += subtotal;

            preparedItems.push({
              product,
              quantity,
              subtotal
            });
          }

          let customerId = null;

          if (
            req.body.customer_id !==
              undefined &&
            req.body.customer_id !==
              null &&
            String(
              req.body.customer_id
            ).trim() !== ""
          ) {
            const customer = db
              .prepare(`
                SELECT id
                FROM customers
                WHERE id = ?
                AND user_id = ?
              `)
              .get(
                Number(
                  req.body.customer_id
                ),
                req.user.id
              );

            if (!customer) {
              throw new Error(
                "Client invalide."
              );
            }

            customerId = customer.id;
          }

          const sale = db
            .prepare(`
              INSERT INTO sales
              (
                user_id,
                customer_id,
                total,
                payment_method,
                note
              )
              VALUES (?, ?, ?, ?, ?)
            `)
            .run(
              req.user.id,
              customerId,
              total,
              String(
                req.body.payment_method ||
                  "cash"
              ),
              String(
                req.body.note || ""
              )
            );

          const insertItem =
            db.prepare(`
              INSERT INTO sale_items
              (
                sale_id,
                product_id,
                product_name,
                quantity,
                unit_price,
                subtotal
              )
              VALUES (?, ?, ?, ?, ?, ?)
            `);

          const updateStock =
            db.prepare(`
              UPDATE products
              SET stock = stock - ?
              WHERE id = ?
            `);

          for (const item of preparedItems) {
            insertItem.run(
              sale.lastInsertRowid,
              item.product.id,
              item.product.name,
              item.quantity,
              item.product.price,
              item.subtotal
            );

            updateStock.run(
              item.quantity,
              item.product.id
            );
          }

          return sale.lastInsertRowid;
        });

      const saleId = transaction();

      res.json({
        ok: true,
        sale_id: saleId
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
);

/* =========================================================
   DEBTS
========================================================= */

app.get(
  "/api/debts",
  requireAuth,
  (req, res) => {
    res.json(
      db
        .prepare(`
          SELECT
            d.*,
            c.name AS customer_name,
            (
              d.amount - d.paid
            ) AS remaining
          FROM debts d
          LEFT JOIN customers c
            ON c.id = d.customer_id
          WHERE d.user_id = ?
          ORDER BY d.id DESC
        `)
        .all(req.user.id)
    );
  }
);

app.post(
  "/api/debts",
  requireAuth,
  (req, res) => {
    const amount = Number(
      req.body.amount || 0
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        error:
          "Montant invalide."
      });
    }

    let customerId = null;

    if (
      req.body.customer_id !==
        undefined &&
      req.body.customer_id !==
        null &&
      String(
        req.body.customer_id
      ).trim() !== ""
    ) {
      const customer = db
        .prepare(`
          SELECT id
          FROM customers
          WHERE id = ?
          AND user_id = ?
        `)
        .get(
          Number(
            req.body.customer_id
          ),
          req.user.id
        );

      if (!customer) {
        return res.status(400).json({
          error:
            "Client invalide."
        });
      }

      customerId = customer.id;
    }

    const result = db
      .prepare(`
        INSERT INTO debts
        (
          user_id,
          customer_id,
          amount,
          note
        )
        VALUES (?, ?, ?, ?)
      `)
      .run(
        req.user.id,
        customerId,
        amount,
        String(
          req.body.note || ""
        )
      );

    res.json({
      ok: true,
      id: result.lastInsertRowid
    });
  }
);

app.get(
  "/api/debts/:id/payments",
  requireAuth,
  (req, res) => {
    const debt = db
      .prepare(`
        SELECT id
        FROM debts
        WHERE id = ?
        AND user_id = ?
      `)
      .get(
        req.params.id,
        req.user.id
      );

    if (!debt) {
      return res.status(404).json({
        error:
          "Dette introuvable."
      });
    }

    const payments = db
      .prepare(`
        SELECT
          id,
          debt_id,
          amount,
          created_at
        FROM debt_payments
        WHERE debt_id = ?
        ORDER BY id DESC
      `)
      .all(debt.id);

    res.json({
      debt_id: debt.id,
      payments
    });
  }
);

app.post(
  "/api/debts/:id/payment",
  requireAuth,
  (req, res) => {
    const debt = db
      .prepare(`
        SELECT *
        FROM debts
        WHERE id = ?
        AND user_id = ?
      `)
      .get(
        req.params.id,
        req.user.id
      );

    if (!debt) {
      return res.status(404).json({
        error:
          "Dette introuvable."
      });
    }

    const amount = Number(
      req.body.amount || 0
    );

    const remaining =
      debt.amount - debt.paid;

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > remaining
    ) {
      return res.status(400).json({
        error:
          "Montant du paiement invalide."
      });
    }

    const transaction =
      db.transaction(() => {
        db.prepare(`
          INSERT INTO debt_payments
          (
            debt_id,
            amount
          )
          VALUES (?, ?)
        `).run(
          debt.id,
          amount
        );

        const newPaid =
          debt.paid + amount;

        db.prepare(`
          UPDATE debts
          SET
            paid = ?,
            status = ?
          WHERE id = ?
        `).run(
          newPaid,
          newPaid >= debt.amount
            ? "paid"
            : "open",
          debt.id
        );
      });

    transaction();

    const updatedDebt = db
      .prepare(`
        SELECT
          d.*,
          (
            d.amount - d.paid
          ) AS remaining
        FROM debts d
        WHERE d.id = ?
      `)
      .get(debt.id);

    res.json({
      ok: true,
      debt: updatedDebt
    });
  }
);

/* =========================================================
   REPORTS
========================================================= */

app.get(
  "/api/reports",
  requireAuth,
  (req, res) => {
    const today = new Date();

    const defaultTo =
      today.toISOString().slice(0, 10);

    const defaultFrom = new Date(
      today.getTime() -
        30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);

    const from = String(
      req.query.from || defaultFrom
    ).trim();

    const to = String(
      req.query.to || defaultTo
    ).trim();

    if (
      !validDate(from) ||
      !validDate(to)
    ) {
      return res.status(400).json({
        error:
          "Période de rapport invalide."
      });
    }

    if (from > to) {
      return res.status(400).json({
        error:
          "La date de début doit être antérieure ou égale à la date de fin."
      });
    }

    const rows = db
      .prepare(`
        SELECT
          date(created_at) AS day,
          COUNT(*) AS sales_count,
          COALESCE(
            SUM(total),
            0
          ) AS total
        FROM sales
        WHERE user_id = ?
        AND date(created_at) >= ?
        AND date(created_at) <= ?
        GROUP BY date(created_at)
        ORDER BY day DESC
      `)
      .all(
        req.user.id,
        from,
        to
      );

    const summary = db
      .prepare(`
        SELECT
          COUNT(*) AS sales_count,
          COALESCE(
            SUM(total),
            0
          ) AS total,
          COALESCE(
            AVG(total),
            0
          ) AS average
        FROM sales
        WHERE user_id = ?
        AND date(created_at) >= ?
        AND date(created_at) <= ?
      `)
      .get(
        req.user.id,
        from,
        to
      );

    res.json({
      from,
      to,
      rows,
      summary
    });
  }
);

/* =========================================================
   CSV EXPORT
========================================================= */

app.get(
  "/api/export/sales.csv",
  requireAuth,
  (req, res) => {
    const rows = db
      .prepare(`
        SELECT
          s.id,
          date(s.created_at) AS date,
          s.total,
          s.payment_method,
          COALESCE(
            c.name,
            ''
          ) AS customer
        FROM sales s
        LEFT JOIN customers c
          ON c.id = s.customer_id
        WHERE s.user_id = ?
        ORDER BY s.id DESC
      `)
      .all(req.user.id);

    const escapeCSV = value => {
      return `"${String(
        value ?? ""
      ).replace(
        /"/g,
        '""'
      )}"`;
    };

    const csv = [
      [
        "ID",
        "Date",
        "Total",
        "Méthode",
        "Client"
      ]
        .map(escapeCSV)
        .join(","),
      ...rows.map(row =>
        [
          row.id,
          row.date,
          row.total,
          row.payment_method,
          row.customer
        ]
          .map(escapeCSV)
          .join(",")
      )
    ].join("\n");

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cashflow-sales.csv"
    );

    res.send(
      "\ufeff" + csv
    );
  }
);

/* =========================================================
   PDF EXPORT
========================================================= */

app.get(
  "/api/export/sales.pdf",
  requireAuth,
  (req, res) => {
    const rows = db
      .prepare(`
        SELECT
          s.id,
          date(s.created_at) AS date,
          s.total,
          s.payment_method,
          COALESCE(
            c.name,
            ''
          ) AS customer
        FROM sales s
        LEFT JOIN customers c
          ON c.id = s.customer_id
        WHERE s.user_id = ?
        ORDER BY s.id DESC
        LIMIT 200
      `)
      .all(req.user.id);

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cashflow-sales.pdf"
    );

    const doc =
      new PDFDocument({
        margin: 50
      });

    doc.pipe(res);

    doc
      .fontSize(22)
      .text(
        `${APP_NAME} — Rapport des ventes`
      );

    doc
      .fontSize(11)
      .text(
        `Compte : ${req.user.email}`
      );

    doc.moveDown();

    if (!rows.length) {
      doc.text(
        "Aucune vente enregistrée."
      );
    }

    for (const row of rows) {
      doc
        .fontSize(10)
        .text(
          `#${row.id} | ${row.date} | ${
            row.customer ||
            "Comptant"
          } | ${
            row.payment_method
          } | ${Number(
            row.total
          ).toFixed(2)}`
        );
    }

    doc.end();
  }
);

/* =========================================================
   ADMIN - STATS
========================================================= */

app.get(
  "/api/admin/stats",
  requireAdmin,
  (req, res) => {
    const users = db
      .prepare(
        "SELECT COUNT(*) AS count FROM users"
      )
      .get()
      .count;

    const active = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE active = 1
      `)
      .get()
      .count;

    const sales = db
      .prepare(`
        SELECT
          COUNT(*) AS count,
          COALESCE(
            SUM(total),
            0
          ) AS total
        FROM sales
      `)
      .get();

    res.json({
      users,
      active,
      sales
    });
  }
);

/* =========================================================
   ADMIN - USERS
========================================================= */

app.get(
  "/api/admin/users",
  requireAdmin,
  (req, res) => {
    res.json(
      db
        .prepare(`
          SELECT
            id,
            name,
            email,
            phone,
            shop_name,
            avatar,
            plan,
            role,
            active,
            created_at
          FROM users
          ORDER BY id DESC
        `)
        .all()
    );
  }
);

/* =========================================================
   ADMIN - UPDATE USER
========================================================= */

app.put(
  "/api/admin/users/:id",
  requireAdmin,
  (req, res) => {
    const target = db
      .prepare(
        "SELECT * FROM users WHERE id = ?"
      )
      .get(req.params.id);

    if (!target) {
      return res.status(404).json({
        error:
          "Utilisateur introuvable."
      });
    }

    if (
      target.email.toLowerCase() ===
        ADMIN_EMAIL &&
      req.body.active === false
    ) {
      return res.status(403).json({
        error:
          "L'administrateur principal ne peut pas être désactivé."
      });
    }

    if (
      target.email.toLowerCase() ===
        ADMIN_EMAIL &&
      req.body.role === "user"
    ) {
      return res.status(403).json({
        error:
          "L'administrateur principal doit rester administrateur."
      });
    }

    const allowedPlans = [
      "free",
      "pro",
      "elite"
    ];

    const plan =
      allowedPlans.includes(
        req.body.plan
      )
        ? req.body.plan
        : target.plan;

    const active =
      req.body.active === false
        ? 0
        : 1;

    const role =
      req.body.role === "admin"
        ? "admin"
        : "user";

    db.prepare(`
      UPDATE users
      SET
        plan = ?,
        active = ?,
        role = ?
      WHERE id = ?
    `).run(
      plan,
      active,
      role,
      target.id
    );

    res.json({
      ok: true,
      user: publicUser(
        getUserById(target.id)
      )
    });
  }
);

/* =========================================================
   ADMIN - DELETE USER
========================================================= */

app.delete(
  "/api/admin/users/:id",
  requireAdmin,
  (req, res) => {
    const target = db
      .prepare(
        "SELECT * FROM users WHERE id = ?"
      )
      .get(req.params.id);

    if (!target) {
      return res.status(404).json({
        error:
          "Utilisateur introuvable."
      });
    }

    if (
      target.email.toLowerCase() ===
      ADMIN_EMAIL
    ) {
      return res.status(403).json({
        error:
          "Impossible de supprimer l'administrateur principal."
      });
    }

    removeAvatar(
      target.avatar
    );

    db.prepare(
      "DELETE FROM users WHERE id = ?"
    ).run(target.id);

    res.json({
      ok: true
    });
  }
);

/* =========================================================
   FRONTEND FALLBACK
========================================================= */

app.use((req, res) => {
  res.sendFile(
    path.join(
      PUBLIC_DIR,
      "index.html"
    )
  );
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      error:
        "Une erreur interne est survenue."
    });
  }
);

/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `${APP_NAME} lancé sur le port ${PORT}`
    );
  }
);
