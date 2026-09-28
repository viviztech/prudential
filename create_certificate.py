from pathlib import Path

from reportlab.graphics import renderPDF, renderSVG
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Circle, Drawing, Group, Line, Path as GPath, Rect, String
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(__file__).resolve().parent
OUT_PDF = ROOT / "output" / "pdf" / "PASQM06004916_A4_recreated.pdf"
OUT_SVG = ROOT / "output" / "figma" / "PASQM06004916_A4_editable.svg"
FONT_DIR = Path(r"C:\Users\USER\.agents\skills\canvas-design\canvas-fonts")

W, H = A4
MM = 72 / 25.4

GOLD = HexColor("#C77A00")
GOLD_DARK = HexColor("#9D5C00")
GOLD_PALE = HexColor("#F4E7CF")
BLUE = HexColor("#2539D8")
BLUE_DARK = HexColor("#17276C")
INK = HexColor("#171A21")
MUTED = HexColor("#5F6470")
PAPER = HexColor("#FFFDF8")
LINE = HexColor("#DED9CD")


def register_fonts():
    pdfmetrics.registerFont(TTFont("Bricolage", str(FONT_DIR / "BricolageGrotesque-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("BricolageBold", str(FONT_DIR / "BricolageGrotesque-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("Crimson", str(FONT_DIR / "CrimsonPro-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("CrimsonBold", str(FONT_DIR / "CrimsonPro-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("DMMono", str(FONT_DIR / "DMMono-Regular.ttf")))


def y(top):
    return H - top


def add_text(d, text, x, top, size, font="Bricolage", fill=INK, anchor="start", opacity=1):
    d.add(String(x, y(top), text, fontName=font, fontSize=size, fillColor=fill,
                 textAnchor=anchor, fillOpacity=opacity))


def add_center(d, text, top, size, font="Bricolage", fill=INK, x=None):
    add_text(d, text, x if x is not None else W / 2, top, size, font, fill, "middle")


def add_rule(d, x1, x2, top, color=LINE, width=0.6):
    d.add(Line(x1, y(top), x2, y(top), strokeColor=color, strokeWidth=width))


def add_pas_seal(d, cx, top, radius, label_size):
    cy = y(top)
    for i in range(24):
        import math
        a = math.radians(i * 15)
        x1 = cx + math.cos(a) * (radius + 1.5)
        y1 = cy + math.sin(a) * (radius + 1.5)
        x2 = cx + math.cos(a) * (radius + 4.0)
        y2 = cy + math.sin(a) * (radius + 4.0)
        d.add(Line(x1, y1, x2, y2, strokeColor=BLUE, strokeWidth=1.1))
    d.add(Circle(cx, cy, radius + 1, fillColor=None, strokeColor=BLUE, strokeWidth=1.2))
    d.add(Circle(cx, cy, radius - 2, fillColor=BLUE, strokeColor=white, strokeWidth=1.0))
    d.add(String(cx, cy - label_size * 0.32, "PAS", fontName="BricolageBold", fontSize=label_size,
                 fillColor=white, textAnchor="middle"))


def add_medallion(d, cx, top):
    import math
    cy = y(top)
    outer = 14 * MM
    for i in range(32):
        a = math.radians(i * 11.25)
        x1 = cx + math.cos(a) * (outer - 2)
        y1 = cy + math.sin(a) * (outer - 2)
        x2 = cx + math.cos(a) * outer
        y2 = cy + math.sin(a) * outer
        d.add(Line(x1, y1, x2, y2, strokeColor=GOLD, strokeWidth=3.8))
    d.add(Circle(cx, cy, 11.5 * MM, fillColor=white, strokeColor=GOLD_DARK, strokeWidth=2))
    d.add(Circle(cx, cy, 8.5 * MM, fillColor=GOLD_PALE, strokeColor=GOLD, strokeWidth=1.2))
    d.add(String(cx, cy + 4, "CERTIFIED", fontName="DMMono", fontSize=6.6, fillColor=GOLD_DARK, textAnchor="middle"))
    d.add(String(cx, cy - 6, "ISO 9001", fontName="BricolageBold", fontSize=10, fillColor=INK, textAnchor="middle"))


def build():
    register_fonts()
    d = Drawing(W, H)
    d.add(Rect(0, 0, W, H, fillColor=PAPER, strokeColor=None))

    # Fine outer border.
    d.add(Rect(8 * MM, 8 * MM, W - 16 * MM, H - 16 * MM, fillColor=None, strokeColor=GOLD_PALE, strokeWidth=0.8))

    # Ceremonial gold canopy with a gentle descending edge.
    p = GPath()
    p.moveTo(0, H)
    p.lineTo(W, H)
    p.lineTo(W, H - 22 * MM)
    p.curveTo(W * 0.73, H - 29 * MM, W * 0.35, H - 34 * MM, 38 * MM, H - 39 * MM)
    p.curveTo(18 * MM, H - 45 * MM, 7 * MM, H - 56 * MM, 0, H - 70 * MM)
    p.closePath()
    p.fillColor = GOLD
    p.strokeColor = None
    d.add(p)
    add_text(d, "ISO 9001:2015", 14 * MM, 18 * MM, 30, "Bricolage", white)
    add_text(d, "QUALITY MANAGEMENT SYSTEM", 14 * MM, 28.5 * MM, 6.7, "DMMono", white, opacity=0.9)

    # Right verification ribbon.
    ribbon_x = W - 27 * MM
    d.add(Rect(ribbon_x, H - 194 * MM, 17 * MM, 172 * MM, fillColor=GOLD, strokeColor=None))
    for idx, top in enumerate([31, 50, 69, 88, 107, 126, 145, 164]):
        add_text(d, "PAS", ribbon_x + 8.5 * MM, top * MM, 10.5, "Bricolage", white, "middle")
    for top in [176, 184, 192]:
        d.add(Line(ribbon_x + 2 * MM, y(top * MM), ribbon_x + 8.5 * MM, y((top + 8) * MM), strokeColor=white, strokeWidth=1.7))
        d.add(Line(ribbon_x + 15 * MM, y(top * MM), ribbon_x + 8.5 * MM, y((top + 8) * MM), strokeColor=white, strokeWidth=1.7))

    # Title and trust mark.
    add_center(d, "CERTIFICATE OF REGISTRATION", 45 * MM, 20, "Crimson", GOLD_DARK, x=W / 2 - 7 * MM)
    add_rule(d, 45 * MM, W - 59 * MM, 50 * MM, GOLD, 1.0)
    add_pas_seal(d, W / 2 - 7 * MM, 65 * MM, 11 * MM, 16)
    add_center(d, "PRUDENTIAL", 81.5 * MM, 13.5, "BricolageBold", BLUE, x=W / 2 - 7 * MM)
    add_center(d, "ASSESSMENT SERVICES LLP", 86 * MM, 6.7, "DMMono", BLUE_DARK, x=W / 2 - 7 * MM)

    # Main certification statement.
    center_x = W / 2 - 7 * MM
    add_center(d, "This is to certify that the Quality Management System of", 101 * MM, 9.3, x=center_x)
    add_center(d, "TrueMan Global Solution Pvt Ltd", 112 * MM, 17, "CrimsonBold", BLUE_DARK, x=center_x)
    add_center(d, "No: 2/17, A-16, Mathias Nagar", 121 * MM, 8.5, fill=MUTED, x=center_x)
    add_center(d, "St. Thomas Mt, Chennai - 600016, India", 127 * MM, 8.5, fill=MUTED, x=center_x)
    add_center(d, "has been assessed and registered by PAS as conforming", 138 * MM, 9.4, x=center_x)
    add_center(d, "to the requirements of", 144 * MM, 9.4, x=center_x)

    # Standard highlight.
    d.add(Rect(51 * MM, y(165 * MM), 94 * MM, 13 * MM, fillColor=GOLD_PALE, strokeColor=None, rx=6, ry=6))
    add_center(d, "ISO 9001:2015", 160.3 * MM, 17.5, "BricolageBold", GOLD_DARK, x=center_x)

    add_center(d, "FOR THE FOLLOWING SCOPE", 173 * MM, 9.5, "DMMono", BLUE_DARK, x=center_x)
    add_center(d, "Provide the service of Import Export Consulting", 181 * MM, 7.3, x=center_x)
    add_center(d, "Clearing Forwarding", 186 * MM, 7.3, x=center_x)
    add_center(d, "Company Registration & Local Body Registration", 191 * MM, 7.3, x=center_x)
    add_center(d, "Further clarifications regarding the scope of this certificate and applicability of ISO 9001:2015", 198 * MM, 6.4, fill=MUTED, x=center_x)
    add_center(d, "requirements may be obtained by consulting the organization.", 202.5 * MM, 6.4, fill=MUTED, x=center_x)

    # Certificate data block.
    add_rule(d, 27 * MM, W - 43 * MM, 210 * MM, LINE, 0.8)
    add_text(d, "CERTIFICATE NUMBER", 27 * MM, 218 * MM, 6.4, "DMMono", MUTED)
    add_text(d, "PASQM06004916", 73 * MM, 218 * MM, 11.5, "BricolageBold", BLUE_DARK)

    labels_left = ["Initial Registration Date", "Certificate Expiry Date", "1st Surveillance Due"]
    vals_left = ["01/01/2016", "01/01/2016", "01/01/2016"]
    labels_right = ["Issue Date", "2nd Surveillance Due"]
    vals_right = ["01/01/2016", "01/01/2016"]
    for i, (lab, val) in enumerate(zip(labels_left, vals_left)):
        top = (229 + i * 7) * MM
        add_text(d, lab, 27 * MM, top, 7.0, fill=MUTED)
        add_text(d, val, 87 * MM, top, 7.2, "DMMono", INK)
    for i, (lab, val) in enumerate(zip(labels_right, vals_right)):
        top = (229 + i * 14) * MM
        add_text(d, lab, 116 * MM, top, 7.0, fill=MUTED)
        add_text(d, val, 159 * MM, top, 7.2, "DMMono", INK)

    # Signature and affiliations.
    add_pas_seal(d, 38 * MM, 259 * MM, 7 * MM, 10)
    add_text(d, "Prudential", 38 * MM, 269 * MM, 8.5, "BricolageBold", BLUE, "middle")
    add_text(d, "Assessment Services LLP", 38 * MM, 273 * MM, 4.2, "DMMono", BLUE_DARK, "middle")
    add_rule(d, 70 * MM, 120 * MM, 263 * MM, INK, 0.7)
    add_text(d, "Auth. Signatory", 95 * MM, 271 * MM, 8.2, "BricolageBold", INK, "middle")
    add_medallion(d, 140 * MM, 259 * MM)
    d.add(Rect(165 * MM, y(270 * MM), 21 * MM, 21 * MM, fillColor=HexColor("#267CEB"), strokeColor=None, rx=3, ry=3))
    add_text(d, "ANSSIA", 175.5 * MM, 260 * MM, 10.5, "BricolageBold", white, "middle")
    add_text(d, "AFFILIATION", 175.5 * MM, 266 * MM, 4.2, "DMMono", white, "middle")

    # Footer band and vector QR code.
    d.add(Rect(0, 0, W, 22 * MM, fillColor=GOLD, strokeColor=None))
    add_text(d, "Prudential Assessment Service LLP", 21 * MM, 280.5 * MM, 7.6, "BricolageBold", white)
    add_text(d, "No.3, Ground Floor, Anjugam Nagar Main Road, Jaffarkhanpet, Chennai - 600 083, Tamil Nadu, India.", 21 * MM, 287 * MM, 4.2, "DMMono", white)
    add_text(d, "+91 44 4280 5454  |  info@prudentialiso.com  |  www.prudentialiso.com", 21 * MM, 292 * MM, 4.2, "DMMono", white)
    add_text(d, "The registration is not a product quality certification.", 120 * MM, 285 * MM, 3.7, "DMMono", white)
    add_text(d, "Subject to successful completion of surveillance audit.", 120 * MM, 289 * MM, 3.7, "DMMono", white)
    add_text(d, "Validity may be confirmed at prudentialiso.com", 120 * MM, 293 * MM, 3.7, "DMMono", white)

    qr = QrCodeWidget("https://www.prudentialiso.com")
    bounds = qr.getBounds()
    qr_size = 18 * MM
    scale = qr_size / max(bounds[2] - bounds[0], bounds[3] - bounds[1])
    qg = Group()
    qg.add(qr)
    qg.scale(scale, scale)
    qg.translate((W - 23 * MM) / scale, 2.5 * MM / scale)
    d.add(Rect(W - 25 * MM, 1.5 * MM, 21 * MM, 21 * MM, fillColor=white, strokeColor=white, strokeWidth=1))
    d.add(qg)

    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    OUT_SVG.parent.mkdir(parents=True, exist_ok=True)
    renderPDF.drawToFile(d, str(OUT_PDF), title="PAS ISO 9001:2015 Certificate")
    renderSVG.drawToFile(d, str(OUT_SVG))
    print(OUT_PDF)
    print(OUT_SVG)


if __name__ == "__main__":
    build()
