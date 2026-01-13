(function () {
  function open(options) {
    const {
      order_id,
      amount,
      onSuccess,
      onFailure,
    } = options;

    if (!order_id || !amount) {
      throw new Error("order_id and amount are required");
    }

    // Create modal
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = 9999;

    const iframe = document.createElement("iframe");
    iframe.src =
      "http://localhost:8000/sdk/checkout.html" +
      `?order_id=${order_id}&amount=${amount}`;
    iframe.style.width = "400px";
    iframe.style.height = "500px";
    iframe.style.border = "none";
    iframe.style.margin = "5% auto";
    iframe.style.display = "block";
    iframe.style.background = "#fff";

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // Listen for postMessage
    window.addEventListener("message", function handler(event) {
      if (!event.data || !event.data.type) return;

      if (event.data.type === "PAYMENT_SUCCESS") {
        onSuccess && onSuccess(event.data.payload);
        cleanup();
      }

      if (event.data.type === "PAYMENT_FAILED") {
        onFailure && onFailure(event.data.payload);
        cleanup();
      }
    });

    function cleanup() {
      window.removeEventListener("message", handler);
      document.body.removeChild(overlay);
    }
  }

  window.PaymentGateway = { open };
})();