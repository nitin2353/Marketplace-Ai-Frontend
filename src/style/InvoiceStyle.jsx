import { StyleSheet } from "@react-pdf/renderer";



// ─── Palette ─────────────────────────────────────────────────────────────────
const ORANGE = "#000000ff";
const DARK = "#12161bff";
const DARK2 = "#1a2332";
const WHITE = "#ffffff";
const GRAY1 = "#f8fafc";
const GRAY2 = "#f1f5f9";
const GRAY3 = "#e2e8f0";
const GRAY4 = "#94a3b8";
const GRAY5 = "#64748b";
const GRAY6 = "#334155";
const GRAY7 = "#1e293b";
const GREEN = "#16a34a";
const GREEN_BG = "#dcfce7";
const RED = "#dc2626";
const RED_BG = "#fee2e2";
const AMBER = "#0649d9ff";
const AMBER_BG = "#fef3c7";
const BLUE = "#2563eb";
const BLUE_BG = "#dbeafe";

// ─── Fonts ───────────────────────────────────────────────────────────────────
const B = "Helvetica-Bold";
const N = "Helvetica";
const CB = "Courier-Bold";
const MONO = "Courier";

const s = StyleSheet.create({
    page: {
        fontFamily: N,
        backgroundColor: WHITE,
        fontSize: 7,
        color: GRAY6,
        paddingBottom: 10,
    },

    header: {
        backgroundColor: DARK, flexDirection: "row",
        justifyContent: "space-between", alignItems: "stretch",
        paddingHorizontal: 28, paddingVertical: 18,
    },
    brand: { fontFamily: B, fontSize: 22, color: WHITE, letterSpacing: 3 },
    brandSub: { fontSize: 7.5, color: GRAY4, letterSpacing: 1.2, marginTop: 30 },
    soldBy: { fontSize: 8, color: GRAY4, marginTop: 20 },
    soldByName: { fontFamily: B, fontSize: 9, color: "#e2e8f0", marginTop: 1 },
    invPill: {
        backgroundColor: ORANGE, paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 4, alignItems: "flex-end",
    },
    invLbl: { fontFamily: B, fontSize: 7.5, color: WHITE, letterSpacing: 2 },
    invNum: { fontFamily: B, fontSize: 13, color: WHITE, marginTop: 2 },
    invDate: { fontSize: 8, color: GRAY4, marginTop: 6, textAlign: "right" },

    orangeBar: { height: 3, backgroundColor: ORANGE },

    metaStrip: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        backgroundColor: GRAY1, paddingHorizontal: 28, paddingVertical: 9,
        borderBottomWidth: 1, borderBottomColor: GRAY3,
    },
    metaItem: { alignItems: "center" },
    metaLbl: { fontSize: 6.5, color: GRAY4, textTransform: "uppercase", letterSpacing: 0.8 },
    metaVal: { fontFamily: B, fontSize: 8.5, color: GRAY7, marginTop: 2 },
    badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, marginTop: 2 },
    badgeTxt: { fontFamily: B, fontSize: 7.5, letterSpacing: 0.4 },

    parties: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: GRAY3 },
    party: { flex: 1, paddingHorizontal: 16, paddingVertical: 12 },
    partyDiv: { borderRightWidth: 1, borderRightColor: GRAY3, borderRightStyle: "dashed" },
    partyLbl: { fontSize: 6.5, fontFamily: B, color: ORANGE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 },
    partyName: { fontFamily: B, fontSize: 10.5, color: GRAY7, marginBottom: 3 },
    partyLine: { fontSize: 8.5, color: GRAY5, lineHeight: 1.55 },
    partyMuted: { fontSize: 7.5, color: GRAY4, marginTop: 3 },

    tableHead: {
        flexDirection: "row", backgroundColor: DARK2,
        paddingHorizontal: 16, paddingVertical: 8,
    },
    th: { fontFamily: B, fontSize: 7.5, color: WHITE, letterSpacing: 0.5, textTransform: "uppercase" },

    tableRow: {
        flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: GRAY3,
        paddingHorizontal: 16, paddingVertical: 10, alignItems: "center",
    },
    rowAlt: { backgroundColor: GRAY1 },
    td: { fontSize: 8.5, color: GRAY5 },
    tdB: { fontFamily: B, fontSize: 8.5, color: GRAY7 },
    tdSm: { fontSize: 7.5, color: GRAY4, marginTop: 2 },
    tdMono: { fontFamily: MONO, fontSize: 7, color: DARK },
    tdMonoB: { fontFamily: CB, fontSize: 8.5, color: GRAY7 },

    colSr: { width: 22 },
    colImg: { width: 40 },
    colProd: { flex: 1 },
    colQty: { width: 32, textAlign: "center" },
    colUnit: { width: 82, textAlign: "right" },
    colLine: { width: 90, textAlign: "right" },

    thumb: { width: 32, height: 32, borderRadius: 4, objectFit: "cover", border: `0.5pt solid ${GRAY3}` },
    thumbPH: {
        width: 32, height: 32, borderRadius: 4,
        backgroundColor: GRAY2, alignItems: "center", justifyContent: "center",
        border: `0.5pt solid ${GRAY3}`,
    },

    totalsOuter: {
        flexDirection: "row", justifyContent: "flex-end",
        paddingRight: 16, borderBottomWidth: 1, borderBottomColor: GRAY3,
    },
    totalsBox: { width: 234 },
    totRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingVertical: 5, paddingHorizontal: 12,
        borderBottomWidth: 0.5, borderBottomColor: GRAY3,
    },
    totLbl: { fontSize: 8.5, color: GRAY4 },
    totVal: { fontFamily: MONO, fontSize: 7, color: GRAY5 },
    totGreen: { fontFamily: CB, fontSize: 8.5, color: GREEN },
    grandRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingVertical: 10, paddingHorizontal: 12,
    },
    grandLbl: { fontFamily: B, fontSize: 10, color: DARK, letterSpacing: 0.5 },
    grandVal: { fontFamily: CB, fontSize: 11, color: ORANGE },

    bottomSec: {
        flexDirection: "row", borderTopWidth: 1,
        borderTopColor: GRAY3, borderTopStyle: "dashed", borderBottomWidth: 1, borderBottomColor: GRAY3,
    },
    bottomL: { flex: 1, padding: 14, borderRightWidth: 1, borderRightColor: GRAY3, borderRightStyle: "dashed" },
    bottomR: { flex: 1, padding: 14 },
    bTitle: { fontFamily: B, fontSize: 7.5, color: ORANGE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
    bRow: { flexDirection: "row", marginBottom: 5, alignItems: "flex-start" },
    bLbl: { fontSize: 8, color: GRAY4, width: 95 },
    bVal: { fontFamily: B, fontSize: 8, color: GRAY6, flex: 1 },

    notesStrip: {
        backgroundColor: "#fff7f4", borderLeftWidth: 3, borderLeftColor: ORANGE,
        marginHorizontal: 14, marginBottom: 10, padding: 10, borderRadius: 3,
    },
    notesTitle: { fontFamily: B, fontSize: 7.5, color: ORANGE, marginBottom: 4, letterSpacing: 0.5 },
    notesTxt: { fontSize: 8, color: GRAY5, lineHeight: 1.6 },

    qrRow: {
        flexDirection: "row", alignItems: "center", gap: 14,
        backgroundColor: GRAY1, marginHorizontal: 14, marginBottom: 10,
        padding: 12, borderRadius: 6, borderWidth: 1, borderColor: GRAY3,
    },
    qrImg: { width: 68, height: 68, borderRadius: 3 },
    qrPH: {
        width: 68, height: 68, borderRadius: 3, backgroundColor: GRAY2,
        alignItems: "center", justifyContent: "center", border: `1pt solid ${GRAY3}`,
    },
    qrRight: { flex: 1 },
    qrTitle: { fontFamily: B, fontSize: 9, color: GRAY7, marginBottom: 3 },
    qrSub: { fontSize: 7.5, color: GRAY4, lineHeight: 1.55 },

    codBox: {
        backgroundColor: AMBER_BG, borderRadius: 5, padding: 9,
        borderWidth: 1, borderColor: "#2432fbff", maxWidth: 130,
    },
    codTitle: { fontFamily: B, fontSize: 8, color: AMBER, marginBottom: 2 },
    codTxt: { fontSize: 7.5, color: AMBER, lineHeight: 1.5 },

    cancelBox: {
        marginTop: 8, padding: 7, backgroundColor: RED_BG,
        borderRadius: 4, borderLeftWidth: 2, borderLeftColor: RED,
    },
    cancelTxt: { fontFamily: B, fontSize: 8, color: RED },
    cancelDt: { fontSize: 7.5, color: RED, marginTop: 2 },

    thankYou: {
        alignItems: "center", paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: GRAY3, marginHorizontal: 14,
    },
    tyTitle: { fontFamily: B, fontSize: 11, color: GRAY7, marginBottom: 3 },
    tySub: { fontSize: 7.5, color: GRAY4 },
    tyStore: { fontSize: 7, color: GRAY4, marginTop: 4, fontStyle: "italic" },
    tyCgi: { fontSize: 7.5, color: GRAY4, marginTop: 5 },

    footer: {
        backgroundColor: DARK, flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 28, paddingVertical: 9,
        position: "absolute", bottom: 0, left: 0, right: 0,
    },
    footerL: { fontSize: 7.5, color: GRAY4 },
    footerBrand: { fontFamily: B, fontSize: 8, color: ORANGE, letterSpacing: 1.5 },
    footerR: { fontSize: 7.5, color: GRAY4 },
    pageNum: { position: "absolute", bottom: 12, right: 28, fontSize: 7.5, color: GRAY4 },

    signatureRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 28,
        paddingTop: 60,
        paddingBottom: 14,
    },

    signatureBox: {
        width: 170,
        alignItems: "center",
    },

    signatureLine: {
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: GRAY4,
        marginBottom: 5,
    },

    signatureText: {
        fontFamily: B,
        fontSize: 8,
        color: GRAY7,
        textAlign: "center",
    },

    signatureSubText: {
        fontSize: 7,
        color: GRAY4,
        marginTop: 3,
        textAlign: "center",
    },
    logo: {
        width: 120,
        height: 32,
        marginTop: -5,
        marginLeft: -8,
        objectFit: "contain",
    },
});

export default s