import csv
import math
from pathlib import Path

from reportlab.graphics import renderPDF, renderSVG
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Circle, Drawing, Group, Line, Path as GPath, Rect, String
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(__file__).resolve().parent
CSV_PATH = ROOT / "output" / "figma" / "certificate_data.csv"
PDF_PATH = ROOT / "output" / "pdf" / "PASQM06004916_A4_premium.pdf"
SVG_PATH = ROOT / "output" / "figma" / "PASQM06004916_A4_premium_editable.svg"
FONT_DIR = Path(r"C:\Users\USER\.agents\skills\canvas-design\canvas-fonts")

W, H = A4
MM = 72 / 25.4
NAVY = HexColor("#071B33")
NAVY_2 = HexColor("#102C4C")
BRASS = HexColor("#B8904B")
BRASS_LIGHT = HexColor("#D8BE83")
IVORY = HexColor("#F8F4EA")
PAPER = HexColor("#FFFCF5")
INK = HexColor("#162235")
SLATE = HexColor("#657080")
HAIR = HexColor("#D8D0BE")


def data():
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as stream:
        return {row["field"]: row["value"] for row in csv.DictReader(stream)}


def fonts():
    pdfmetrics.registerFont(TTFont("Italiana", str(FONT_DIR / "Italiana-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Instrument", str(FONT_DIR / "InstrumentSans-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("InstrumentBold", str(FONT_DIR / "InstrumentSans-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("DMMono", str(FONT_DIR / "DMMono-Regular.ttf")))


def yy(top):
    return H - top


def text(d, value, x, top, size, font="Instrument", color=INK, anchor="start", opacity=1):
    d.add(String(x, yy(top), value, fontName=font, fontSize=size, fillColor=color,
                 textAnchor=anchor, fillOpacity=opacity))


def center(d, value, top, size, font="Instrument", color=INK, x=None):
    text(d, value, W / 2 if x is None else x, top, size, font, color, "middle")


def top_rect(d, x, top, width, height, fill=None, stroke=None, stroke_width=1, radius=0):
    d.add(Rect(x, yy(top + height), width, height, fillColor=fill, strokeColor=stroke,
               strokeWidth=stroke_width, rx=radius, ry=radius))


def rosette(d, cx, top, radius, color=BRASS, opacity=0.14, rings=6):
    cy = yy(top)
    for ring in range(rings):
        r = radius * (0.44 + ring * 0.105)
        for i in range(24):
            a = math.radians(i * 15 + ring * 4)
            x1 = cx + math.cos(a) * r
            y1 = cy + math.sin(a) * r
            x2 = cx + math.cos(a + math.radians(42)) * r
            y2 = cy + math.sin(a + math.radians(42)) * r
            d.add(Line(x1, y1, x2, y2, strokeColor=color, strokeWidth=0.35, strokeOpacity=opacity))


def logo_placeholder(d, cx, top, width, height, label, circular=False):
    if circular:
        r = min(width, height) / 2
        d.add(Circle(cx, yy(top), r, fillColor=PAPER, strokeColor=BRASS, strokeWidth=1.1,
                     strokeDashArray=[3, 2]))
        d.add(Circle(cx, yy(top), r - 3 * MM, fillColor=None, strokeColor=BRASS_LIGHT, strokeWidth=0.5))
        center(d, label, top + 1.2 * MM, 5.5, "DMMono", BRASS, cx)
    else:
        top_rect(d, cx - width / 2, top - height / 2, width, height, PAPER, BRASS, 0.8, 2 * MM)
        center(d, label, top + 1.2 * MM, 5.2, "DMMono", BRASS, cx)


def premium_certificate(values):
    fonts()
    d = Drawing(W, H)
    d.add(Rect(0, 0, W, H, fillColor=IVORY, strokeColor=None))

    # Layered architectural frame.
    d.add(Rect(5 * MM, 5 * MM, W - 10 * MM, H - 10 * MM, fillColor=None, strokeColor=NAVY, strokeWidth=3.2))
    d.add(Rect(7.2 * MM, 7.2 * MM, W - 14.4 * MM, H - 14.4 * MM, fillColor=None, strokeColor=BRASS, strokeWidth=0.75))
    d.add(Rect(10 * MM, 10 * MM, W - 20 * MM, H - 20 * MM, fillColor=PAPER, strokeColor=HAIR, strokeWidth=0.45))

    # Midnight prologue panel.
    top_rect(d, 10 * MM, 10 * MM, W - 20 * MM, 49 * MM, NAVY, None)
    for i in range(9):
        d.add(Circle(W / 2, yy(34.5 * MM), (14 + i * 5.5) * MM, fillColor=None,
                     strokeColor=BRASS, strokeWidth=0.35, strokeOpacity=0.16))
    text(d, values["standard"], 18 * MM, 21 * MM, 6.7, "DMMono", BRASS_LIGHT)
    text(d, "REGISTERED MANAGEMENT SYSTEM", W - 18 * MM, 21 * MM, 5.2, "DMMono", BRASS_LIGHT, "end")
    center(d, values["certificate_title"], 41.5 * MM, 25, "Italiana", white)
    d.add(Line(57 * MM, yy(48.5 * MM), W - 57 * MM, yy(48.5 * MM), strokeColor=BRASS, strokeWidth=0.9))

    # Primary logo placeholder and issuer lockup.
    logo_placeholder(d, W / 2, 63.5 * MM, 22 * MM, 22 * MM, "PRIMARY LOGO", True)
    center(d, values["issuer_name"], 79 * MM, 12.5, "Italiana", NAVY)
    center(d, values["issuer_subtitle"], 84.5 * MM, 5.1, "DMMono", SLATE)

    # Invisible audit geometry behind the content.
    rosette(d, W / 2, 145 * MM, 48 * MM, BRASS, 0.07, 7)
    for offset in range(-3, 4):
        d.add(Line(18 * MM, yy((143 + offset * 4) * MM), W - 18 * MM, yy((143 - offset * 4) * MM),
                   strokeColor=NAVY_2, strokeWidth=0.3, strokeOpacity=0.035))

    center(d, values["intro_line"], 98 * MM, 8.2, "Instrument", SLATE)
    center(d, values["organization"], 111 * MM, 21, "Italiana", NAVY)
    center(d, values["address_line_1"], 120.5 * MM, 7.2, "Instrument", SLATE)
    center(d, values["address_line_2"], 126 * MM, 7.2, "Instrument", SLATE)
    center(d, values["conformity_line_1"], 138 * MM, 8.2, "Instrument", INK)
    center(d, values["conformity_line_2"], 144 * MM, 8.2, "Instrument", INK)

    # Foil-like standard cartouche.
    top_rect(d, 55 * MM, 151 * MM, 100 * MM, 17 * MM, NAVY, BRASS, 0.8, 8.5 * MM)
    center(d, values["standard"], 162.5 * MM, 15.5, "InstrumentBold", BRASS_LIGHT)

    center(d, values["scope_heading"], 177.5 * MM, 5.8, "DMMono", BRASS)
    center(d, values["scope_line_1"], 186 * MM, 7.4, "Instrument", INK)
    center(d, values["scope_line_2"], 191.5 * MM, 7.4, "Instrument", INK)
    center(d, values["scope_line_3"], 197 * MM, 7.4, "Instrument", INK)
    center(d, values["clarification_line_1"], 204.5 * MM, 5.2, "Instrument", SLATE)
    center(d, values["clarification_line_2"], 209 * MM, 5.2, "Instrument", SLATE)

    # Registry record card.
    top_rect(d, 18 * MM, 216 * MM, W - 36 * MM, 39 * MM, PAPER, HAIR, 0.7, 2.5 * MM)
    text(d, "REGISTRY RECORD", 24 * MM, 224 * MM, 5.4, "DMMono", BRASS)
    text(d, values["certificate_number"], W - 24 * MM, 224 * MM, 11.5, "InstrumentBold", NAVY, "end")
    d.add(Line(24 * MM, yy(228.5 * MM), W - 24 * MM, yy(228.5 * MM), strokeColor=HAIR, strokeWidth=0.55))

    record = [
        ("INITIAL REGISTRATION", values["initial_registration_date"], 24, 234),
        ("ISSUE DATE", values["issue_date"], 112, 234),
        ("CERTIFICATE EXPIRY", values["certificate_expiry_date"], 24, 245),
        ("1ST SURVEILLANCE", values["first_surveillance_due"], 89, 245),
        ("2ND SURVEILLANCE", values["second_surveillance_due"], 151, 245),
    ]
    for label, val, x_mm, top_mm in record:
        text(d, label, x_mm * MM, top_mm * MM, 4.3, "DMMono", SLATE)
        text(d, val, x_mm * MM, (top_mm + 5.1) * MM, 6.7, "InstrumentBold", NAVY)

    # Authentication zone: placeholders are intentionally discrete.
    logo_placeholder(d, 29 * MM, 267 * MM, 27 * MM, 12 * MM, "ISSUER LOGO")
    d.add(Line(51 * MM, yy(267 * MM), 101 * MM, yy(267 * MM), strokeColor=NAVY, strokeWidth=0.65))
    center(d, values["signatory_label"], 273 * MM, 6.8, "InstrumentBold", NAVY, 76 * MM)
    logo_placeholder(d, 123 * MM, 267 * MM, 22 * MM, 12 * MM, "SEAL / MARK")
    logo_placeholder(d, 151 * MM, 267 * MM, 22 * MM, 12 * MM, "AFFILIATION")

    # Footer and verification.
    text(d, values["footer_address"], 16 * MM, 277.2 * MM, 3.0, "DMMono", SLATE)
    top_rect(d, 10 * MM, 279 * MM, W - 20 * MM, 8 * MM, NAVY, None)
    text(d, values["footer_name"], 16 * MM, 282.8 * MM, 4.7, "InstrumentBold", white)
    text(d, values["footer_contact"], 16 * MM, 285.7 * MM, 2.8, "DMMono", BRASS_LIGHT)
    text(d, values["footer_note_1"], 100 * MM, 282.6 * MM, 2.7, "DMMono", white)
    text(d, values["footer_note_2"], 100 * MM, 285.5 * MM, 2.7, "DMMono", white)

    qr = QrCodeWidget(values["verification_url"])
    b = qr.getBounds()
    size = 14 * MM
    scale = size / max(b[2] - b[0], b[3] - b[1])
    qg = Group()
    qg.add(qr)
    qg.scale(scale, scale)
    qg.translate((W - 27 * MM) / scale, 12 * MM / scale)
    top_rect(d, W - 30 * MM, 267 * MM, 18 * MM, 18 * MM, white, BRASS, 0.7, 1 * MM)
    d.add(qg)

    PDF_PATH.parent.mkdir(parents=True, exist_ok=True)
    SVG_PATH.parent.mkdir(parents=True, exist_ok=True)
    renderPDF.drawToFile(d, str(PDF_PATH), title="Premium ISO 9001 Certificate")
    renderSVG.drawToFile(d, str(SVG_PATH))
    print(PDF_PATH)
    print(SVG_PATH)


if __name__ == "__main__":
    premium_certificate(data())
