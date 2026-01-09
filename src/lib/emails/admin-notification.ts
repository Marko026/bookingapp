import { BookingData } from "./types";
import { COMMON_STYLES } from "./styles";
import { formatDateSR } from "./utils";

export function createBookingEmail(data: BookingData) {
	const checkInFormatted = formatDateSR(data.checkIn);
	const checkOutFormatted = formatDateSR(data.checkOut);

	return `
<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Rezervacija - Apartmani Todorović</title>
    <style>${COMMON_STYLES}</style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="hero">
            <div class="brand">
                <span class="brand-logo">T</span>
                <span class="brand-name">APARTMANI TODOROVIĆ</span>
            </div>
            <h1 class="hero-title">Nova Rezervacija!</h1>
            <p class="hero-subtitle">Stigao je novi upit za smeštaj u Golubcu.</p>
        </div>

        <div class="content">
            <!-- Reservation Card -->
            <div class="card">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td align="left">
                            <p class="label">Referenca Rezervacije</p>
                            <p class="value">#AT-2026-${data.apartmentId}${Math.floor(Math.random() * 1000)}</p>
                        </td>
                        <td align="right">
                            <span class="status-badge">Na Čekanju</span>
                        </td>
                    </tr>
                </table>

                <div style="height: 1px; background-color: #e2e8f0; margin: 20px 0;"></div>

                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td width="50%">
                            <p class="label">Check-in</p>
                            <p class="value">${checkInFormatted}</p>
                        </td>
                        <td width="50%">
                            <p class="label">Check-out</p>
                            <p class="value">${checkOutFormatted}</p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Property Section -->
            <div class="property-section">
                <div style="display: table-cell; vertical-align: middle; padding-right: 20px;">
                    <img src="${data.apartmentImage}" class="property-image" alt="Apartment">
                </div>
                <div style="display: table-cell; vertical-align: middle;">
                    <h2 class="property-name">${data.apartmentName}</h2>
                    <p class="property-meta">Golubac, Srbija • ID: #${data.apartmentId}</p>
                    <div style="margin-top: 8px;">
                        <span class="amenity-tag">Gost: ${data.guestName}</span>
                        <div style="margin-top: 12px;">
                            <span class="label">Ukupan Iznos</span>
                            <div class="price-highlight">€${data.totalPrice}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Guest Note -->
            ${
							data.question
								? `
            <div class="note-section">
                <p class="note-text">
                    "${data.question}"
                </p>
                <p style="margin-top: 8px; font-weight: 700; font-size: 14px; color: #1e293b;">— Poruka od gosta</p>
            </div>
            `
								: ""
						}

            <!-- Action Button -->
            <div class="btn-container">
                <a href="mailto:${data.guestEmail}" class="btn">Odgovori Gostu</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-links">
                <a href="#">Sajt</a>
                <a href="#">Lokacija</a>
                <a href="#">Kontakt</a>
            </div>
            <p class="footer-text">
                © 2026 Apartmani Todorović. Sva prava zadržana.<br>
                Luksuzni smeštaj u srcu podunavlja • Vinci, Golubac
            </p>
        </div>
    </div>
</body>
</html>
	`;
}
