const vscode = acquireVsCodeApi();

window.addEventListener("message", (event) => {
	const { elements } = event.data;
	const container = document.getElementById("container");
	container.innerHTML = "";

	const groups = [...new Set(elements.map(e => e.group))];
	groups.forEach(group => {
		const groupBox = document.createElement("div");
		groupBox.innerHTML = `<h3>${group}</h3>`;
		groupBox.className = "group";

		elements.filter(e => e.group === group).forEach(elem => {
			const item = document.createElement("div");
			item.className = "item";
			item.innerHTML = `
        <label for="${elem.key}">${elem.label}</label>
        <input type="color" id="${elem.key}" value="${elem.defaultColor}">
      `;
			groupBox.appendChild(item);

			const input = item.querySelector("input");
			input.addEventListener("input", () => {
				vscode.postMessage({ type: "colorChange", key: elem.key, color: input.value });
			});
		});

		container.appendChild(groupBox);
	});
});
