const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");

admin.initializeApp();

const SMTP_HOST = defineSecret("SMTP_HOST");
const SMTP_PORT = defineSecret("SMTP_PORT");
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");

const APP_NAME = "Roo7z";
const APP_EMAIL = "Contact@roo7z.com";
const APP_REGION = "asia-south1";

let transporterPromise;

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(amount, currency) {
  const code = String(currency || "PKR").toUpperCase();
  const locale = code === "GBP" ? "en-GB" : "en-PK";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code
    }).format(toNumber(amount));
  } catch (error) {
    return `${code} ${toNumber(amount).toFixed(2)}`;
  }
}

function resolveSecure(port) {
  return toNumber(port) === 465;
}

function buildItemsRows(items = [], currency = "PKR") {
  return items
    .map((item) => {
      const qty = toNumber(item.quantity || item.qty || 1);
      const unit = toNumber(item.unit_price || item.pricePKR || item.priceGBP || 0);
      const lineTotal = toNumber(item.line_total || unit * qty);
      const title = escapeHtml(item.title || "Item");
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ececec;">${title}</td>
          <td style="padding:8px;border-bottom:1px solid #ececec;text-align:center;">${qty}</td>
          <td style="padding:8px;border-bottom:1px solid #ececec;text-align:right;">${formatCurrency(unit, currency)}</td>
          <td style="padding:8px;border-bottom:1px solid #ececec;text-align:right;">${formatCurrency(lineTotal, currency)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildCustomerEmail({ orderId, order, orderDateText }) {
  const customerName = escapeHtml(order.name || "Valued Customer");
  const currency = String(order.currency || "PKR").toUpperCase();
  const subtotal = formatCurrency(order.subtotal, currency);
  const delivery = formatCurrency(order.delivery_charges, currency);
  const total = formatCurrency(order.total, currency);
  const deliveryLabel = escapeHtml(order.delivery_label || "Delivery Charges");
  const paymentMethod = escapeHtml(
    order.payment_method === "cod" ? "Cash on Delivery" : (order.payment_method || "N/A")
  );
  const addressLines = [
    order.address,
    order.city,
    order.phone
  ]
    .filter(Boolean)
    .map((value) => escapeHtml(value))
    .join("<br>");

  const itemsHtml = buildItemsRows(order.items || [], currency);

  const subject = `${APP_NAME} Order Confirmation #${orderId}`;
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f7f8fa;padding:20px;color:#111;">
      <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
        <div style="background:#214740;color:#fff;padding:18px 20px;">
          <h2 style="margin:0;font-size:22px;">Order Confirmed</h2>
          <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">Thank you for shopping with ${APP_NAME}.</p>
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 14px;">Hi ${customerName},</p>
          <p style="margin:0 0 14px;">
            We have received your order. Our team will process it shortly.
          </p>

          <div style="background:#f5f7f8;border:1px solid #ebeff0;border-radius:8px;padding:12px 14px;margin-bottom:16px;">
            <div><strong>Order ID:</strong> ${escapeHtml(orderId)}</div>
            <div><strong>Order Date:</strong> ${escapeHtml(orderDateText)}</div>
            <div><strong>Payment Method:</strong> ${paymentMethod}</div>
          </div>

          <h3 style="margin:0 0 10px;font-size:16px;">Order Items</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <thead>
              <tr style="background:#fafafa;">
                <th style="padding:8px;border-bottom:1px solid #ececec;text-align:left;">Item</th>
                <th style="padding:8px;border-bottom:1px solid #ececec;text-align:center;">Qty</th>
                <th style="padding:8px;border-bottom:1px solid #ececec;text-align:right;">Price</th>
                <th style="padding:8px;border-bottom:1px solid #ececec;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;padding:4px 0;">
              <span>Subtotal</span>
              <strong>${subtotal}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;">
              <span>${deliveryLabel}</span>
              <strong>${delivery}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:1px solid #ececec;margin-top:6px;">
              <span style="font-size:16px;">Grand Total</span>
              <strong style="font-size:16px;">${total}</strong>
            </div>
          </div>

          <h3 style="margin:0 0 8px;font-size:16px;">Delivery Details</h3>
          <p style="margin:0 0 14px;line-height:1.5;">${addressLines || "N/A"}</p>

          <p style="margin:0;color:#4b5563;font-size:13px;">
            Need help? Contact us at ${APP_EMAIL}
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, html };
}

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = Promise.resolve().then(() => {
    const host = SMTP_HOST.value();
    const port = toNumber(SMTP_PORT.value());
    const user = SMTP_USER.value();
    const pass = SMTP_PASS.value();

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: resolveSecure(port),
      auth: { user, pass }
    });

    return { transporter, user };
  });

  return transporterPromise;
}

async function sendOrderConfirmation(event, sourceType) {
  const snap = event.data;
  if (!snap) {
    logger.warn("Missing snapshot in event", { sourceType });
    return;
  }

  const order = snap.data() || {};
  const orderId = event.params.orderId || snap.id;
  const customerEmail = String(order.email || "").trim();

  if (!customerEmail) {
    logger.warn("Order has no customer email; skipping confirmation", { orderId, sourceType });
    await snap.ref.set({
      emailStatus: {
        confirmation: "skipped_no_email",
        attemptedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }, { merge: true });
    return;
  }

  try {
    const { transporter, user } = await getTransporter();
    const orderDate = order.date?.toDate ? order.date.toDate() : new Date();
    const orderDateText = orderDate.toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const { subject, html } = buildCustomerEmail({ orderId, order, orderDateText });

    await transporter.sendMail({
      from: `${APP_NAME} <${user}>`,
      to: customerEmail,
      subject,
      html
    });

    await snap.ref.set({
      emailStatus: {
        confirmation: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }, { merge: true });

    logger.info("Order confirmation email sent", {
      orderId,
      sourceType,
      to: customerEmail
    });
  } catch (error) {
    logger.error("Failed to send order confirmation email", {
      orderId,
      sourceType,
      message: error?.message || String(error)
    });

    await snap.ref.set({
      emailStatus: {
        confirmation: "failed",
        attemptedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: String(error?.message || "Unknown SMTP error").slice(0, 300)
      }
    }, { merge: true });
  }
}

const triggerOptions = {
  region: APP_REGION,
  secrets: [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS]
};

exports.sendOrderConfirmationForUserOrder = onDocumentCreated(
  {
    ...triggerOptions,
    document: "users/{userId}/orders/{orderId}"
  },
  async (event) => sendOrderConfirmation(event, "user_order")
);

exports.sendOrderConfirmationForGuestOrder = onDocumentCreated(
  {
    ...triggerOptions,
    document: "guest_orders/{orderId}"
  },
  async (event) => sendOrderConfirmation(event, "guest_order")
);
