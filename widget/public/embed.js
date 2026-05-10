(function () {

  if (window.ACP_CHAT_LOADED) return;

  window.ACP_CHAT_LOADED = true;

  function createWidget(scriptTag) {

    const widgetKey =
      scriptTag.getAttribute(
        "data-widget-key"
      );

    console.log(
      "ACP Widget Key:",
      widgetKey
    );

    if (!widgetKey) {
      console.error(
        "No widget key found"
      );
      return;
    }

    const iframe =
      document.createElement("iframe");

    iframe.src =
      `http://localhost:3002/?widget_key=${widgetKey}`;

    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "380px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.zIndex = "999999";
    iframe.style.background = "transparent";

    document.body.appendChild(iframe);
  }

  // Find THIS script specifically
  const scripts =
    document.getElementsByTagName("script");

  for (let script of scripts) {

    if (
      script.src.includes("embed.js")
    ) {

      if (document.readyState === "complete") {

        createWidget(script);

      } else {

        window.addEventListener(
          "load",
          () => createWidget(script)
        );
      }

      break;
    }
  }

})();