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

};