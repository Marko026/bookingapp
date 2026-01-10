import { COMMON_STYLES } from "./styles";
import type { BookingData } from "./types";
import { formatDateSR } from "./utils";

export function createGuestConfirmationEmail(data: BookingData) {
	const checkInFormatted = formatDateSR(data.checkIn);
	const checkOutFormatted = formatDateSR(data.checkOut);

	return `
<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Potvrda Rezervacije - Apartmani Todorović</title>
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
            <h1 class="hero-title">Vaša rezervacija je primljena!</h1>
            <p class="hero-subtitle">Radujemo se što ćemo Vas ugostiti u Golubcu.</p>
        </div>

        <div class="content">
            <!-- Reservation Card -->
            <div class="card">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td align="left">
                            <p class="label">Status</p>
                            <p class="value">Zahtev Primljen</p>
                        </td>
                        <td align="right">
                            <span class="status-badge" style="background-color: #fef3c7; color: #d97706;">U Obradi</span>
                        </td>
                    </tr>
                </table>

                <div style="height: 1px; background-color: #e2e8f0; margin: 20px 0;"></div>

                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td width="33%">
                            <p class="label">Check-in</p>
                            <p class="value">${checkInFormatted}</p>
                        </td>
                        <td width="33%">
                            <p class="label">Check-out</p>
                            <p class="value">${checkOutFormatted}</p>
                        </td>
                        <td width="33%" align="right">
                            <p class="label" style="text-align: right;">Ukupno</p>
                            <div class="price-highlight">€${data.totalPrice}</div>
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
                    <p class="property-meta">Vinci, Golubac, Srbija</p>
                    <div style="margin-top: 8px;">
                        <span class="amenity-tag">Smeštaj Potvrđen</span>
                        <span class="amenity-tag">Premium Usluga</span>
                    </div>
                </div>
            </div>

            <p style="color: #64748b; line-height: 1.7; font-size: 15px; margin-bottom: 32px;">
                Poštovani/a <strong>${data.guestName}</strong>,<br><br>
                Vaš upit za smeštaj je uspešno prosleđen našem timu. Uskoro ćemo Vas kontaktirati putem telefona ili emaila radi finalne potvrde termina. Hvala Vam na ukazanom poverenju!
            </p>

            <!-- Action Button -->
            <div class="btn-container">
                <a href="https://apartmanitodorovic.rs" class="btn">Posetite Naš Sajt</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-links">
                <a href="#">Instagram</a>
                <a href="#">Facebook</a>
                <a href="#">Kontakt</a>
            </div>
            <p class="footer-text">
                © 2026 Apartmani Todorović. Sva prava zadržana.<br>
                Ovo je automatska potvrda o prijemu vašeg zahteva.
            </p>
        </div>
    </div>
</body>
</html>
	`;
}
