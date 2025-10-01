const nobrSpace = "\xa0";
const ditSign = ".";

export function numberFormat(value: number, decimal: number = 2, decimalRequired = false): string {
	let number = String(value);
	const ended = number.indexOf(".");
	let end = "";

	if (ended !== -1) {
		end = number.substring(ended + 1);
		if (end.length > decimal) {
			if (decimal > 0) {
				const endNum = parseInt(end.substring(0, decimal));
				end = endNum === 0 ? "" : String(endNum);
			} else {
				end = "";
			}
		}
		if (end.length) {
			end = ditSign + end;
		}
		number = number.substring(0, ended);
	}

	if (decimalRequired && decimal > 0) {
		if (!end) {
			end = ".";
		}
		const delta = end.length - 1;
		if (delta > 0 && delta < decimal) {
			end += "0".repeat(delta);
		}
	}

	let len = number.length;
	if (len < 4) {
		return number + end;
	}

	let ceil = "";
	while (len > 3) {
		len -= 3;
		ceil = nobrSpace + number.substring(len) + ceil;
		number = number.substring(0, len);
	}

	return number + ceil + end;
}
