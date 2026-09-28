import csv
from pathlib import Path

from PIL import Image
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
CSV_PATH = ROOT / "output" / "figma" / "certificate_data.csv"
BG_SOURCE = ROOT / "output" / "imagegen" / "iso_certificate_security_background.png"
BG_A4 = ROOT / "tmp" / "pdfs" / "iso_certificate_security_background_a4.png"
OUT_PDF = ROOT / "output" / "pdf" / "PASQM06004916_A4_gpt_background.pdf"
FONT_DIR = Path(r"C:\Users\USER\.agents\skills\canvas-design\canvas-fonts")

W, H = A4
MM = 72 / 25.4
NAVY = HexColor("#0A2242")
BLUE = HexColor("#174A8B")
CYAN = HexColor("#7DBFDE")
GOLD = HexColor("#B48A43")
GOLD_LIGHT = HexColor("#D7BD85")
INK = HexColor("#111827")
SLATE = HexColor("#5E6876")
PAPER = HexColor("#FFFDF8")


def read_data():
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as stream:
        return {row["field"]: row["value"] for row in csv.DictReader(stream)}


def register_fonts():
    pdfmetrics.registerFont(TTFont("Gloock", str(FONT_DIR / "Gloock-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Instrument", str(FONT_DIR / "InstrumentSans-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("InstrumentBold", str(FONT_DIR / "InstrumentSans-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("DMMono", str(FONT_DIR / "DMMono-Regular.ttf")))


def crop_background():
    BG_A4.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(BG_SOURCE) as image:
        image = image.convert("RGB")
        target_ratio = W / H
        current_ratio = image.width / image.height
        if current_ratio < target_ratio:
            new_h = round(image.width / target_ratio)
            top = (image.height - new_h) // 2
            image = image.crop((0, top, image.width, top + new_h))
        elif current_ratio > target_ratio:
            new_w = round(image.height * target_ratio)
            left = (image.width - new_w) // 2
            image = image.crop((left, 0, left + new_w, image.height))
        image.resize((2480, 3508), Image.Resampling.LANCZOS).save(BG_A4, quality=95)


def txt(c, value, x, top, size, font="Instrument", color=INK, align="left"):
    c.setFillColor(color)
    c.setFont(font, size)
    y = H - top
    if align == "center":
        c.drawCentredString(x, y, value)
    elif align == "right":
        c.drawRightString(x, y, value)
    else:
        c.drawString(x, y, value)


def center(c, value, top, size, font="Instrument", color=INK):
    txt(c, value, W / 2, top, size, font, color, "center")


def logo_slot(c, cx, top, width, height, label, circle=False):
    c.saveState()
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.setDash(3, 2)
    c.setFillColor(PAPER)
    c.setFillAlpha(0.88)
    if circle:
        r = min(width, height) / 2
        c.circle(cx, H - top, r, stroke=1, fill=1)
    else:
        c.roundRect(cx - width / 2, H - top - height / 2, width, height, 2.5 * MM, stroke=1, fill=1)
    c.restoreState()
    txt(c, label, cx, top + 1.3 * MM, 5.1, "DMMono", GOLD, "center")


def draw_qr(c, value, x, y, size):
    widget = QrCodeWidget(value)
    bounds = widget.getBounds()
    drawing = Drawing(size, size, transform=[size / (bounds[2] - bounds[0]), 0, 0,
                                            size / (bounds[3] - bounds[1]), 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, c, x, y)


def build(values):
    register_fonts()
    crop_background()
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT_PDF), pagesize=A4, pageCompression=1)
    c.setTitle("ISO 9001 Certificate - GPT Background Edition")
    c.drawImage(ImageReader(str(BG_A4)), 0, 0, W, H, preserveAspectRatio=True, mask="auto")

    # Fine print frame keeps the fluid background disciplined.
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.25)
    c.rect(8 * MM, 8 * MM, W - 16 * MM, H - 16 * MM, stroke=1, fill=0)
    c.setStrokeColor(GOLD_LIGHT)
    c.setLineWidth(0.5)
    c.rect(10 * MM, 10 * MM, W - 20 * MM, H - 20 * MM, stroke=1, fill=0)

    txt(c, values["standard"], 16 * MM, 20 * MM, 6.2, "DMMono", BLUE)
    txt(c, "QUALITY MANAGEMENT SYSTEM", W - 16 * MM, 20 * MM, 5.1, "DMMono", SLATE, "right")
    center(c, "CERTIFICATE", 37 * MM, 24, "Gloock", NAVY)
    center(c, "OF REGISTRATION", 45 * MM, 8.5, "DMMono", GOLD)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(75 * MM, H - 50 * MM, 135 * MM, H - 50 * MM)

    logo_slot(c, W / 2, 61 * MM, 19 * MM, 19 * MM, "PRIMARY LOGO", True)
    center(c, values["issuer_name"], 75 * MM, 13.5, "Gloock", NAVY)
    center(c, values["issuer_subtitle"], 80.5 * MM, 6.7, "DMMono", SLATE)

    center(c, values["intro_line"], 94 * MM, 9.3, "Instrument", SLATE)
    center(c, values["organization"], 107 * MM, 18, "Gloock", NAVY)
    center(c, values["address_line_1"], 117 * MM, 8.2, "Instrument", INK)
    center(c, values["address_line_2"], 122.5 * MM, 8.2, "Instrument", INK)
    center(c, values["conformity_line_1"], 135 * MM, 9.2, "Instrument", INK)
    center(c, values["conformity_line_2"], 141 * MM, 9.2, "Instrument", INK)

    # Standard statement with clean sample-like emphasis.
    c.saveState()
    c.setFillColor(PAPER)
    c.setFillAlpha(0.88)
    c.roundRect(49 * MM, H - 164 * MM, 112 * MM, 17 * MM, 8.5 * MM, stroke=0, fill=1)
    c.restoreState()
    center(c, values["standard"], 158.7 * MM, 19, "InstrumentBold", NAVY)
    center(c, "QUALITY MANAGEMENT SYSTEM", 168.5 * MM, 9.5, "InstrumentBold", BLUE)
    center(c, "FOR THE FOLLOWING SCOPE", 177 * MM, 9.5, "Instrument", INK)
    center(c, values["scope_line_1"], 186 * MM, 7.4, "Instrument", INK)
    center(c, values["scope_line_2"], 191.2 * MM, 7.4, "Instrument", INK)
    center(c, values["scope_line_3"], 196.4 * MM, 7.4, "Instrument", INK)

    # Registry information on a translucent panel.
    c.saveState()
    c.setFillColor(PAPER)
    c.setFillAlpha(0.84)
    c.setStrokeColor(GOLD_LIGHT)
    c.setLineWidth(0.6)
    c.roundRect(21 * MM, H - 246 * MM, W - 42 * MM, 40 * MM, 3 * MM, stroke=1, fill=1)
    c.restoreState()
    txt(c, "Certificate Number :", 27 * MM, 215.5 * MM, 8.5, "Instrument", INK)
    txt(c, values["certificate_number"], W - 27 * MM, 215.5 * MM, 12.5, "InstrumentBold", NAVY, "right")
    c.setStrokeColor(GOLD_LIGHT)
    c.line(27 * MM, H - 219.5 * MM, W - 27 * MM, H - 219.5 * MM)

    fields = [
        ("INITIAL REGISTRATION", values["initial_registration_date"], 27, 226),
        ("ISSUE DATE", values["issue_date"], 111, 226),
        ("CERTIFICATE EXPIRY", values["certificate_expiry_date"], 27, 237),
        ("1ST SURVEILLANCE", values["first_surveillance_due"], 82, 237),
        ("2ND SURVEILLANCE", values["second_surveillance_due"], 141, 237),
    ]
    for label, value, x_mm, top_mm in fields:
        txt(c, label, x_mm * MM, top_mm * MM, 6.0, "Instrument", SLATE)
        txt(c, value, x_mm * MM, (top_mm + 5.5) * MM, 7.5, "InstrumentBold", NAVY)

    center(c, values["clarification_line_1"], 251.5 * MM, 6.1, "Instrument", SLATE)
    center(c, values["clarification_line_2"], 256.5 * MM, 6.1, "Instrument", SLATE)

    # Authentication zone with replaceable logo slots.
    logo_slot(c, 31 * MM, 266 * MM, 27 * MM, 12 * MM, "ISSUER LOGO")
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.65)
    c.line(54 * MM, H - 266 * MM, 105 * MM, H - 266 * MM)
    txt(c, values["signatory_label"], 79.5 * MM, 273 * MM, 8.2, "InstrumentBold", NAVY, "center")
    logo_slot(c, 126 * MM, 266 * MM, 22 * MM, 12 * MM, "SEAL / MARK")
    logo_slot(c, 153 * MM, 266 * MM, 22 * MM, 12 * MM, "AFFILIATION")

    # Verification block floats over the lower ribbon.
    c.saveState()
    c.setFillColor(white)
    c.setFillAlpha(0.95)
    c.setStrokeColor(GOLD)
    c.roundRect(W - 31 * MM, 12 * MM, 18 * MM, 18 * MM, 1.5 * MM, stroke=1, fill=1)
    c.restoreState()
    draw_qr(c, values["verification_url"], W - 29 * MM, 14 * MM, 14 * MM)
    c.saveState()
    c.setFillColor(PAPER)
    c.setFillAlpha(0.82)
    c.roundRect(13 * MM, H - 293 * MM, 132 * MM, 13 * MM, 2 * MM, stroke=0, fill=1)
    c.restoreState()
    txt(c, values["footer_name"], 16 * MM, 283 * MM, 7.0, "InstrumentBold", NAVY)
    txt(c, values["footer_contact"], 16 * MM, 287.2 * MM, 4.2, "Instrument", SLATE)
    txt(c, values["footer_note_2"], 16 * MM, 291.2 * MM, 4.0, "Instrument", SLATE)

    c.showPage()
    c.save()
    print(OUT_PDF)


if __name__ == "__main__":
    build(read_data())
