import { COMMON_STYLES } from "./styles";
import type { BookingData } from "./types";
import { formatDateEN, formatDateSR } from "./utils";

export function createGuestApprovalEmail(data: BookingData) {
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
    <title>Booking Confirmed - Apartmani Todorović</title>
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
            <h1 class="hero-title">Your Booking is Confirmed!</h1>
            <p class="hero-subtitle">We look forward to welcoming you to Golubac.</p>
        </div>

        <div class="content">
            <!-- Reservation Card -->
            <div class="card">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td align="left">
                            <p class="label">Status</p>
                            <p class="value">Booking Confirmed</p>
                        </td>
                        <td align="right">
                            <span class="status-badge" style="background-color: #ecfdf5; color: #059669;">Confirmed</span>
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
                    <p class="property-meta">Vinci, Golubac, Serbia</p>
                    <div style="margin-top: 8px;">
                        <span class="amenity-tag">Accommodation Confirmed</span>
                        <span class="amenity-tag">Premium Service</span>
                    </div>
                </div>
            </div>

            <p style="color: #64748b; line-height: 1.7; font-size: 15px; margin-bottom: 32px;">
                Dear <strong>${data.guestName}</strong>,<br><br>
                We are pleased to confirm your reservation at Apartmani Todorović. Your booking has been approved and everything is set for your stay. Should you need any assistance before your arrival, please do not hesitate to contact us.
            </p>

            <!-- Action Button -->
            <div class="btn-container">
                <a href="https://apartmani-todorovic.com" class="btn">Visit Our Website</a>
            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: #e2e8f0; margin: 40px 0;"></div>

            <!-- Serbian Section -->
            <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
                <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0;">Rezervacija Potvrđena</h3>
                
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
                            <div class="price-highlight">€${data.totalPrice}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <p style="color: #64748b; line-height: 1.7; font-size: 15px; margin-bottom: 32px;">
                Poštovani/a <strong>${data.guestName}</strong>,<br><br>
                Zadovoljstvo nam je da potvrdimo Vašu rezervaciju u Apartmanima Todorović. Vaš zahtev je odobren i sve je spremno za Vaš dolazak. Ukoliko Vam je potrebna bilo kakva pomoć pre dolaska, slobodno nas kontaktirajte.
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
