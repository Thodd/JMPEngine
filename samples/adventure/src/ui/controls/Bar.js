class HealthBar {
	constructor() {
		this._dom = {
			container: document.createElement("div")
		};

		this._dom.container.className = 'adv_health_bar';
		this._dom.container.innerHTML = `
			<div class='adv_health_bar_filling'></div>
			<p class='adv_health_bar_text'></p>
		`;

		this._dom.filling = this._dom.container.getElementsByClassName("adv_health_bar_filling")[0];
		this._dom.text = this._dom.container.getElementsByClassName("adv_health_bar_text")[0];

		this.maxValue = 10;
		this.value = 10;
	}

	getDom() {
		return this._dom.container;
	}

	setValue(v) {
		this.value = v;

		// update bar
		let percentage = `${100 * (this.value / this.maxValue)}%`;
		this._dom.filling.style.width = percentage;

		// update text
		this._dom.text.textContent = `${this.value}/${this.maxValue}`;
	}

	setMaxValue(mv) {
		this.maxValue = mv;
	}
}

export default HealthBar;