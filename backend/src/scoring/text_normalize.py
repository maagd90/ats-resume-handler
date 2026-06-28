import re
import unicodedata


# Characters that commonly break legacy ATS parsers (not normal letters or punctuation).
PROBLEMATIC_CHARS_RE = re.compile(
    r"[\u0000-\u0008\u000b\u000c\u000e-\u001f"
    r"\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff"
    r"\ufffd]"
)


def normalize_resume_text(text: str) -> str:
    if not text:
        return ""
    cleaned = unicodedata.normalize("NFC", text)
    cleaned = cleaned.replace("\x00", "")
    cleaned = PROBLEMATIC_CHARS_RE.sub("", cleaned)
    cleaned = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f]", "", cleaned)
    return cleaned


def ascii_safe_for_export(text: str) -> str:
    """Normalize text for legacy ATS parsers that only accept ASCII."""
    normalized = normalize_resume_text(text)
    replacements = {
        "\u2014": "-",
        "\u2013": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2022": "-",
        "\u00b7": "-",
        "\u00a0": " ",
    }
    for src, dst in replacements.items():
        normalized = normalized.replace(src, dst)
    nfkd = unicodedata.normalize("NFKD", normalized)
    return nfkd.encode("ascii", "ignore").decode("ascii")


def has_problematic_characters(text: str) -> bool:
    return bool(PROBLEMATIC_CHARS_RE.search(text))
