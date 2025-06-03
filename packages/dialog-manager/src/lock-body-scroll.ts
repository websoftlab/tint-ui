// A change of the browser zoom change the scrollbar size.
// Credit https://github.com/twbs/bootstrap/blob/3ffe3a5d82f6f561b82ff78d82b32a7d14aed558/js/src/modal.js#L512-L519
function getScrollbarSize() {
	if (window.innerHeight > document.body.offsetHeight) {
		return 0;
	}

	const scrollDiv = document.createElement("div");
	scrollDiv.style.width = "99px";
	scrollDiv.style.height = "99px";
	scrollDiv.style.position = "absolute";
	scrollDiv.style.top = "-9999px";
	scrollDiv.style.overflow = "scroll";

	document.body.appendChild(scrollDiv);
	const scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
	document.body.removeChild(scrollDiv);

	return scrollbarSize || 0;
}

// Got from https://usehooks.com/useLockBodyScroll/
export function lockBodyScroll() {
	if (typeof window === "undefined" || !("getComputedStyle" in window)) {
		return () => {};
	}

	// Get original body overflow
	const originalStyle = window.getComputedStyle(document.body).overflow;
	const scrollbarSize = getScrollbarSize();
	const style = document.body.style;

	// Prevent scrolling on mount
	style.overflow = "hidden";
	style.setProperty("--scroll-bar-size", `${scrollbarSize}px`);

	// Re-enable scrolling when component unmounts
	return () => {
		style.overflow = originalStyle;
		style.setProperty("--scroll-bar-size", null);
	};
}
