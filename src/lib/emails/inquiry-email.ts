import { COMMON_STYLES } from "./styles";

export interface InquiryData {
	name: string;
	email: string;
	message: string;
}

export function createInquiryEmail(data: InquiryData) {
	return `
<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Poruka - Apartmani Todorović</title>
    <style>${COMMON_STYLES}</style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <div class="brand">
                <span class="brand-logo">T</span>
                <span class="brand-name">APARTMANI TODOROVIĆ</span>
            </div>
            <h1 class="hero-title">Nova Poruka od Posetioca</h1>
        </div>

        <div class="content">
            <div class="card">
                <p class="label">Ime</p>
                <p class="value">${data.name}</p>

                <div style="height: 1px; background-color: #e2e8f0; margin: 16px 0;"></div>

                <p class="label">Email</p>
                <p class="value">${data.email}</p>

                <div style="height: 1px; background-color: #e2e8f0; margin: 16px 0;"></div>

                <p class="label">Poruka</p>
                <p style="color: #334155; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${data.message}</p>
            </div>

            <div class="btn-container">
                <a href="mailto:${data.email}" class="btn">Odgovori Posetiocu</a>
            </div>
        </div>

        <div class="footer">
            <p class="footer-text">
                © 2026 Apartmani Todorović<br>
                Ova poruka je automatski generisana iz kontakt forme na sajtu.
            </p>
        </div>
    </div>
</body>
</html>
	`;
}
