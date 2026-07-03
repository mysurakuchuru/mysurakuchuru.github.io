"""Validate local portfolio pages without external dependencies."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]


class PageAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.links: list[str] = []
        self.assets: list[str] = []
        self.language: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "html":
            self.language = values.get("lang")
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "a" and values.get("href"):
            self.links.append(values["href"])
        if tag in {"script", "img"} and values.get("src"):
            self.assets.append(values["src"])
        if tag == "link" and values.get("href") and values.get("rel") in {
            "stylesheet",
            "icon",
        }:
            self.assets.append(values["href"])


def audit_page(page: str) -> None:
    parser = PageAudit()
    parser.feed((ROOT / page).read_text())
    assert parser.language == "en", f"{page}: missing language"
    assert len(parser.ids) == len(set(parser.ids)), f"{page}: duplicate ids"

    for link in parser.links:
        if link.startswith("#"):
            assert link[1:] in parser.ids, f"{page}: broken anchor {link}"
        elif not urlparse(link).scheme and not link.startswith("mailto:"):
            assert (ROOT / link).exists(), f"{page}: missing local link {link}"

    for asset in parser.assets:
        if not asset.startswith("http"):
            assert (ROOT / asset).exists(), f"{page}: missing asset {asset}"

    print(f"{page}: passed")


if __name__ == "__main__":
    audit_page("index.html")
    audit_page("resume.html")
