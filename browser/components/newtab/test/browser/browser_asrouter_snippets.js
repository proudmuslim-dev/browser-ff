"use strict";

const { ASRouter } = ChromeUtils.import(
  "resource://activity-stream/lib/ASRouter.jsm"
);

add_task(async function some_test() {
  ASRouter._validPreviewEndpoint = () => true;
  await BrowserTestUtils.withNewTab(
    {
      gBrowser,
      url:
        "about:newtab?endpoint=https://example.com/browser/browser/components/newtab/test/browser/snippet_below_search_test.json",
    },
    async browser => {
      await waitForPreloaded(browser);

      const complete = await SpecialPowers.spawn(browser, [], async () => {
        // Verify the simple_below_search_snippet renders in container below searchbox
        // and nothing is rendered in the footer.
        await ContentTaskUtils.waitForCondition(
          () =>
            content.document.querySelector(
              ".below-search-snippet .SimpleBelowSearchSnippet"
            ),
          "Should find the snippet inside the below search container"
        );

        is(
          0,
          content.document.querySelector("#footer-asrouter-container")
            .childNodes.length,
          "Should not find any snippets in the footer container"
        );

        return true;
      });

      Assert.ok(complete, "Test complete.");
    }
  );
});

add_task(async function some_test() {
  await BrowserTestUtils.withNewTab(
    {
      gBrowser,
      url:
        "about:newtab?endpoint=https://example.com/browser/browser/components/newtab/test/browser/snippet_simple_test.json",
    },
    async browser => {
      await waitForPreloaded(browser);

      const complete = await SpecialPowers.spawn(browser, [], async () => {
        const syncLink = "https://www.mozilla.org/en-US/firefox/accounts";
        // Verify the simple_snippet renders in the footer and the container below
        // searchbox is not rendered.
        await ContentTaskUtils.waitForCondition(
          () =>
            content.document.querySelector(
              "#footer-asrouter-container .SimpleSnippet"
            ),
          "Should find the snippet inside the footer container"
        );
        await ContentTaskUtils.waitForCondition(
          () =>
            content.document.querySelector(
              "#footer-asrouter-container .SimpleSnippet .icon"
            ),
          "Should render an icon"
        );
        await ContentTaskUtils.waitForCondition(
          () =>
            content.document.querySelector(
              `#footer-asrouter-container .SimpleSnippet a[href='${syncLink}']`
            ),
          "Should render an anchor with the correct href"
        );

        ok(
          !content.document.querySelector(".below-search-snippet"),
          "Should not find any snippets below search"
        );

        return true;
      });

      Assert.ok(complete, "Test complete.");
    }
  );
});

add_task(async () => {
  ASRouter._validPreviewEndpoint = () => true;
  await BrowserTestUtils.withNewTab(
    {
      gBrowser,
      url:
        "about:newtab?endpoint=https://example.com/browser/browser/components/newtab/test/browser/snippet.json",
    },
    async browser => {
      let text = await SpecialPowers.spawn(browser, [], async () => {
        await ContentTaskUtils.waitForCondition(
          () => content.document.querySelector(".activity-stream"),
          `Should render Activity Stream`
        );
        await ContentTaskUtils.waitForCondition(
          () =>
            content.document.querySelector(
              "#footer-asrouter-container .SimpleSnippet"
            ),
          "Should find the snippet inside the footer container"
        );

        return content.document.querySelector(
          "#footer-asrouter-container .SimpleSnippet"
        ).innerText;
      });

      Assert.equal(
        text,
        "On January 30th Nightly will introduce dedicated profiles, making it simpler to run different installations of Firefox side by side. Learn what this means for you.",
        "Snippet content match"
      );
    }
  );
});
