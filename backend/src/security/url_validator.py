"""Validate outbound and user-supplied URLs before server-side fetch or redirect."""

from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse


class UnsafeUrlError(ValueError):
    pass


def validate_http_url(url: str, *, field_name: str = "url") -> str:
    """Allow only public http(s) URLs — blocks SSRF to internal/metadata hosts."""
    if not url or not url.strip():
        raise UnsafeUrlError(f"Missing {field_name}")

    parsed = urlparse(url.strip())
    if parsed.scheme not in ("http", "https"):
        raise UnsafeUrlError(f"Invalid {field_name}: only http and https are allowed")

    host = parsed.hostname
    if not host:
        raise UnsafeUrlError(f"Invalid {field_name}: missing host")

    host_lower = host.lower()
    if host_lower in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        raise UnsafeUrlError(f"Invalid {field_name}: localhost not allowed")

    try:
        addr_infos = socket.getaddrinfo(host, None)
    except socket.gaierror as exc:
        raise UnsafeUrlError(f"Invalid {field_name}: cannot resolve host") from exc

    for info in addr_infos:
        ip_str = info[4][0]
        try:
            ip = ipaddress.ip_address(ip_str)
        except ValueError:
            continue
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
        ):
            raise UnsafeUrlError(f"Invalid {field_name}: private or internal addresses are blocked")

    return url.strip()


def safe_href_or_none(url: str | None) -> str | None:
    """Client-safe helper pattern — returns None if URL fails validation."""
    if not url:
        return None
    try:
        return validate_http_url(url)
    except UnsafeUrlError:
        return None
