export const formResetData = {

    customer: (rowData = {}) => ({
        first_name: rowData?.first_name,
        last_name: rowData?.last_name,
        name: rowData?.name || "",
        phone: rowData?.phone || "",
        email: rowData?.email || "",
        password: rowData?.password || "",
        gender: rowData?.gender || "",
        notify: rowData?.notify || false
    }),

    seller: (rowData = {}) => ({
        user_id: rowData?.user_id || "",
        business_name: rowData?.business_name || "",
        business_type: rowData?.business_type || "",
        category: rowData?.category || "",
        experience: rowData?.experience || 0,
        description: rowData?.description || "",
        country: rowData?.country || "India",
        state: rowData?.state || "",
        city: rowData?.city || "",
        pincode: rowData?.pincode || "",
        full_address: rowData?.full_address || "",
        account_number: rowData?.account_number || "",
        ifsc_code: rowData?.ifsc_code || "",
        account_holder_name: rowData?.account_holder_name || "",
        upi_id: rowData?.upi_id || "",
        pan_number: rowData?.pan_number || "",
        aadhaar_number: rowData?.aadhaar_number || "",
        status: rowData?.status || "pending",
        notify: rowData?.notify || false
    }),

    product: (product = {}) => ({
        title: product.title || "",
        description: product.description || "",
        brand: product.brand || "",
        category: product.category || "",
        base_price: product.base_price || "",
        old_price: product.old_price || "",
        stock: product.stock || "",
        weight: product.weight || "",
        length: product.length || "",
        width: product.width || "",
        height: product.height || "",
        status: product.status || true,
        delivery_days: product.delivery_days || "",
        min_stock_alert: product.min_stock_alert || "",
        return_replace_duration: product.return_replace_duration || "",
        return_replace_instructions: product.return_replace_instructions || "",
        slug: product.slug || "",
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
        customization_type: product.customization_type || "",
        customization_fields: JSON.stringify(product.customization_fields) || "",
    })

};