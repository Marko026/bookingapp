import { COMMON_STYLES } from "./styles";
import type { BookingData } from "./types";
import { formatDateEN, formatDateSR } from "./utils";

export function createGuestCancellationEmail(data: BookingData) {
	const checkInSR = formatDateSR(data.checkIn);
	const checkOutSR = formatDateSR(data.checkOut);
	const checkInEN = formatDateEN(data.checkIn);
	const checkOutEN = formatDateEN(data.checkOut);

	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled - Apartmani Todorović</title>
    <style>${COMMON_STYLES}</style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="hero" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-bottom-color: #ef4444;">
            <div class="brand">
                <span class="brand-logo" style="background-color: #ef4444;">T</span>
                <span class="brand-name">APARTMANI TODOROVIĆ</span>
            </div>
            <h1 class="hero-title">Booking Cancelled</h1>
            <p class="hero-subtitle">Your reservation has been cancelled.</p>
        </div>

        <div class="content">
            <!-- Reservation Card -->
            <div class="card">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td align="left">
                            <p class="label">Status</p>
                            <p class="value">Booking Cancelled</p>
                        </td>
                        <td align="right">
                            <span class="status-badge" style="background-color: #fef2f2; color: #dc2626;">Cancelled</span>
                        </td>
                    </tr>
                </table>

                <div style="height: 1px; background-color: #e2e8f0; margin: 20px 0;"></div>

                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td width="33%">
                            <p class="label">Check-in</p>
                            <p class="value">${checkInEN}</p>
                        </td>
                        <td width="33%">
                            <p class="label">Check-out</p>
                            <p class="value">${checkOutEN}</p>
                        </td>
                        <td width="33%" align="right">
                            <p class="label" style="text-align: right;">Total</p>
                            <div class="price-highlight" style="color: #94a3b8;">€${data.totalPrice}</div>
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
                    <p class="property-meta">Vinci, Golubac, Serbia</p>
                </div>
            </div>

            <p style="color: #64748b; line-height: 1.7; font-size: 15px; margin-bottom: 32px;">
                Dear <strong>${data.guestName}</strong>,<br><br>
                We regret to inform you that your reservation at Apartmani Todorović has been cancelled. If you have any questions or would like to make a new booking, please do not hesitate to contact us.
            </p>

            <!-- Action Button -->
            <div class="btn-container">
                <a href="https://apartmani-todorovic.com" class="btn">Visit Our Website</a>
            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: #e2e8f0; margin: 40px 0;"></div>

            <!-- Serbian Section -->
            <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
                <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0;">Rezervacija Otkazana</h3>
                
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td width="33%">
                            <p class="label">Check-in</p>
                            <p class="value">${checkInSR}</p>
                        </td>
                        <td width="33%">
                            <p class="label">Check-out</p>
                            <p class="value">${checkOutSR}</p>
                        </td>
                        <td width="33%" align="right">
                            <p class="label" style="text-align: right;">Ukupno</p>
                            <div class="price-highlight" style="color: #94a3b8;">€${data.totalPrice}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <p style="color: #64748b; line-height: 1.7; font-size: 15px; margin-bottom: 32px;">
                Poštovani/a <strong>${data.guestName}</strong>,<br><br>
                Žao nam je što Vas obaveštavamo da je Vaša rezervacija u Apartmanima Todorović otkazana. Ukoliko imate bilo kakvih pitanja ili želite da napravite novu rezervaciju, slobodno nas kontaktirajte.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-links">
                <a href="https://www.instagram.com/apartmanitodorovic_vinci/">Instagram</a>
                <a href="https://www.facebook.com/apartmanitodorovicvinci/">Facebook</a>
                <a href="mailto:info@apartmani-todorovic.com">Contact</a>
            </div>
            <p class="footer-text">
                © 2026 Apartmani Todorović. All rights reserved.<br>
                Luxury accommodation in the heart of Podunavlje • Vinci, Golubac
            </p>
        </div>
    </div>
</body>
</html>
	`;
}
