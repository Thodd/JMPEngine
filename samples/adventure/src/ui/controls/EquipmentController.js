/**
 * The EquipmentController handles:
 * - Rendering of the currently equipped items
 * - interactions on the equipment slots, e.g. equipping, unequipping, using, ...
 */
const EquipmentController = {
	_containerDOM: null,

	/**
	 * Initialize the EquipmentController,
	 * @param {Element} containerDOM the container DOM element into which the Equipment will be rendered
	 */
	init(containerDOM) {
		this._containerDOM = containerDOM;
	}
}

export default EquipmentController;