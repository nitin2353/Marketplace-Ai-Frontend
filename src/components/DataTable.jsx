import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
    Table,
    Form,
    InputGroup,
    Row,
    Col,
    Pagination,
    Badge,
    Container,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { TABLE_HEADERS } from "./../helper/GlobalHelper"

const ROWS_OPTIONS = [5, 10, 25];



const SortIcon = ({ columnKey, sortConfig }) => {
    if (sortConfig.key !== columnKey) return <span className="text-muted ms-1">↕</span>;
    return <span className="ms-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
};

const DataTable = ({
    tableData = [],
    getStatusColor,
    title = "Recent Orders",
    isSearch = true,
    isHeader = true,
    isPagination = true
}) => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const handleSort = useCallback((key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
        setCurrentPage(1);
    }, []);

    const handleSearch = useCallback((e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleRowsPerPage = useCallback((e) => {
        const value = Number(e.target.value);
        setItemsPerPage(value);
        setCurrentPage(1);
    }, []);

    const getValue = (item, key) => {
        if (item[key] !== undefined && item[key] !== null) return item[key];
        switch (key) {
            case "id": return item.order_id || item.id;
            case "buyer": return item.buyer_name || item.customer_name || item.buyer;
            case "amount": return item.subtotal || item.total_amount || item.amount;
            case "qty": return item.total_items || item.quantity || item.qty;
            case "date": return item.created_at || item.created_time || item.date;
            default: return item[key];
        }
    };

    const filteredAndSorted = useMemo(() => {
        const q = search.trim().toLowerCase();

        const uniqueData = Array.from(
            new Map(
                tableData.map((item, index) => {
                    const uniqueKey = getValue(item, "id") ?? item.order_number ?? index;
                    return [uniqueKey, item];
                })
            ).values()
        );

        let data = q
            ? uniqueData.filter((item) => {
                const id = getValue(item, "id") ?? "";
                const buyer = getValue(item, "buyer") ?? "";
                const status = item.status ?? "";

                return (
                    String(id).toLowerCase().includes(q) ||
                    String(buyer).toLowerCase().includes(q) ||
                    String(status).toLowerCase().includes(q)
                );
            })
            : [...uniqueData];

        // ✅ sort copied data only
        data = [...data].sort((a, b) => {
            let aVal = getValue(a, sortConfig.key);
            let bVal = getValue(b, sortConfig.key);

            if (sortConfig.key === "date") {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            } else if (["amount", "qty", "id"].includes(sortConfig.key)) {
                const nA = Number(aVal);
                const nB = Number(bVal);

                if (!isNaN(nA) && !isNaN(nB)) {
                    aVal = nA;
                    bVal = nB;
                } else {
                    aVal = String(aVal ?? "").toLowerCase();
                    bVal = String(bVal ?? "").toLowerCase();
                }
            } else {
                aVal = String(aVal ?? "").toLowerCase();
                bVal = String(bVal ?? "").toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

        return data;
    }, [tableData, search, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        return filteredAndSorted.slice(start, end);
    }, [filteredAndSorted, currentPage, itemsPerPage]);

    // Clamp page if filter/rows-per-page change reduces total pages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const startItem = filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredAndSorted.length);

    return (
        <Container fluid className="mt-3 mb-4 p-3 rounded-4" style={{ background: "var(--card)" }}>
            {/* Toolbar: Search + Rows per page */}
            {
                isHeader &&
                <Row className="mb-3 align-items-center g-2">

                    {
                        isSearch &&
                        <Col xs={12} sm={7} md={6} lg={5}>
                            <InputGroup size="sm">
                                <InputGroup.Text>🔍</InputGroup.Text>
                                <Form.Control
                                    type="search"
                                    placeholder="Search by Order ID, Buyer, Status…"
                                    value={search}
                                    size="lg"
                                    onChange={handleSearch}
                                />
                            </InputGroup>
                        </Col>}

                    <Col xs="auto" className="ms-sm-auto">
                        <InputGroup size="sm">
                            <InputGroup.Text className="border-0 bg-transparent">Row Per page</InputGroup.Text>
                            <Form.Select
                                value={itemsPerPage}
                                onChange={handleRowsPerPage}
                                style={{ width: "80px" }}
                                className="border-0"
                            >
                                {ROWS_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Col>
                </Row>}

            {filteredAndSorted.length === 0 ? (
                <div className="text-muted d-flex justify-content-center"><p>No orders found.</p></div>
            ) : (
                <>
                    <div className="table-responsive pt-2 pb-2" style={{ borderTop: "1px solid #cfc8c8", borderBottom: "1px solid #cfc8c8" }}>
                        <Table striped hover size="sm" className="mb-2 align-middle">
                            <thead>
                                <tr>
                                    {TABLE_HEADERS.map(({ label, key }) => (
                                        <th
                                            key={key}
                                            onClick={() => handleSort(key)}
                                            role="button"
                                            className="text-uppercase fw-bold text-nowrap"
                                            style={{ fontSize: ".67rem", letterSpacing: ".05em", cursor: "pointer", userSelect: "none" }}
                                        >
                                            {label}
                                            <SortIcon columnKey={key} sortConfig={sortConfig} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {paginated.map((order, idx) => {
                                    const id = getValue(order, "id");
                                    const buyer = getValue(order, "buyer");
                                    const qty = getValue(order, "qty");
                                    const amount = getValue(order, "amount");
                                    const date = getValue(order, "date");

                                    return (
                                        <tr key={id ?? idx}>
                                            <td>
                                                <span className="fw-bold text-primary text-nowrap"
                                                    style={{ fontSize: ".78rem", cursor: "pointer" }} onClick={() => navigate(`/seller/orders/${id}`)}>
                                                    {id}
                                                </span>
                                            </td>

                                            <td className="text-nowrap" style={{ fontSize: ".78rem" }}>
                                                {buyer}
                                            </td>

                                            <td style={{ fontSize: ".78rem" }}>{qty}</td>

                                            <td className="fw-bold text-nowrap" style={{ fontSize: ".78rem" }}>
                                                ₹{Number(amount || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td>
                                                <Badge
                                                    bg={getStatusColor?.(order.status) ?? "secondary"}
                                                    style={{ fontSize: ".65rem", letterSpacing: ".04em" }}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </td>

                                            <td className="text-nowrap text-muted" style={{ fontSize: ".75rem" }}>
                                                {date
                                                    ? new Date(date).toLocaleDateString("en-IN")
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>

                    {/* Footer: count + pagination */}
                    <Row className="align-items-center mt-3">
                        <Col xs={12} md={6}>
                            <small className="text-muted">
                                Showing {startItem}–{endItem} of {filteredAndSorted.length} orders
                            </small>
                        </Col>

                        <Col xs={12} md={6} className="d-flex justify-content-md-end mt-2 mt-md-0">
                            {totalPages > 1 && (
                                <Pagination size="sm" className="mb-0 flex-wrap">
                                    <Pagination.Prev
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    />
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Pagination.Item
                                            key={page}
                                            active={page === currentPage}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    />
                                </Pagination>
                            )}
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default DataTable;