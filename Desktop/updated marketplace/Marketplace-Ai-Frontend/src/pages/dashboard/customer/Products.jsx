import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../components/Card";

export default function Products() {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const res = await API.get("/product");
        setProducts(res.data.data);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Products</h2>

            <div className="grid grid-cols-2 gap-4">
                {products.map(p => (
                    <Card key={p.id}>
                        <h3>{p.name}</h3>
                        <p>₹ {p.price}</p>
                        <p>{p.description}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}