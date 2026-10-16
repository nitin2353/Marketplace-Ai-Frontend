import React from "react";

const OrderRow = React.memo(function OrderRow({
    order,
    selected,
    toggleSelect,
    openDrawer,
    handleStatusUpdate,
}) {
    return (
        <tr
            className={selected ? "selected" : ""}
            onClick={() => openDrawer(order)}
        >
            {/* row content */}
        </tr>
    );
});