export const COMMON_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    
    body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #f8fafc;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
    }

    .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
        border: 1px solid #f1f5f9;
    }

    .hero {
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        padding: 40px;
        color: #1e293b;
        position: relative;
        border-bottom: 3px solid #f59e0b;
    }

    .brand-logo {
        width: 32px;
        height: 32px;
        background-color: #f59e0b;
        border-radius: 8px;
        display: inline-block;
        text-align: center;
        line-height: 32px;
        font-weight: 800;
        font-size: 18px;
        color: #ffffff;
        margin-right: 10px;
    }

    .brand-name {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.02em;
        vertical-align: middle;
        color: #1e293b;
    }

    .hero-title {
        font-size: 32px;
        font-weight: 800;
        margin: 24px 0 8px 0;
        letter-spacing: -0.03em;
        color: #1e293b;
    }

    .hero-subtitle {
        color: #64748b;
        font-size: 16px;
        margin: 0;
    }

    .content {
        padding: 32px;
    }

    .card {
        background-color: #f8fafc;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        border: 1px solid #f1f5f9;
    }

    .label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #94a3b8;
        margin-bottom: 4px;
    }

    .value {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
    }

    .status-badge {
        display: inline-block;
        background-color: #ecfdf5;
        color: #059669;
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .price-highlight {
        font-size: 28px;
        font-weight: 800;
        color: #f59e0b;
        letter-spacing: -0.02em;
    }

    .property-section {
        display: flex;
        gap: 20px;
        margin-bottom: 32px;
        align-items: center;
    }

    .property-image {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        object-fit: cover;
    }

    .property-name {
        font-size: 18px;
        font-weight: 800;
        color: #1a1a1a;
        margin: 0 0 4px 0;
    }

    .property-meta {
        font-size: 14px;
        color: #64748b;
        margin: 0;
    }

    .amenity-tag {
        font-size: 12px;
        background-color: #f1f5f9;
        color: #475569;
        padding: 2px 8px;
        border-radius: 4px;
        margin-right: 6px;
    }

    .note-section {
        border-left: 4px solid #f59e0b;
        padding-left: 20px;
        margin: 32px 0;
    }

    .note-text {
        font-style: italic;
        color: #4b5563;
        line-height: 1.6;
        margin: 0;
    }

    .btn-container {
        text-align: center;
        margin-top: 32px;
    }

    .btn {
        display: inline-block;
        background-color: #f59e0b;
        color: #ffffff;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 16px;
        font-weight: 700;
        font-size: 16px;
        box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);
    }

    .footer {
        padding: 32px;
        text-align: center;
        background-color: #f8fafc;
        border-top: 1px solid #f1f5f9;
    }

    .footer-links a {
        color: #94a3b8;
        text-decoration: none;
        margin: 0 12px;
        font-size: 13px;
        font-weight: 600;
    }

    .footer-text {
        color: #adb5bd;
        font-size: 12px;
        margin-top: 24px;
        line-height: 1.5;
    }

    /* Responsive tweaks za manje ekrane (mobilni) */
    @media (max-width: 600px) {
        body {
            padding: 0;
        }

        .container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 0;
        }

        .hero {
            padding: 24px 20px;
        }

        .hero-title {
            font-size: 24px;
        }

        .hero-subtitle {
            font-size: 14px;
        }

        .content {
            padding: 20px 16px;
        }

        .card {
            padding: 16px;
        }

        .property-section {
            flex-direction: column;
            align-items: flex-start;
        }

        .property-image {
            width: 72px;
            height: 72px;
            margin-bottom: 12px;
        }

        /* Tabele sa više kolona postaju vertikalne na mobilnom */
        table {
            width: 100% !important;
        }

        td {
            display: block;
            width: 100% !important;
            box-sizing: border-box;
            padding-bottom: 8px;
        }

        td:last-child {
            padding-bottom: 0;
            text-align: left !important;
        }

        .price-highlight {
            font-size: 22px;
        }

        .btn-container {
            margin-top: 24px;
        }

        .btn {
            width: 100%;
            box-sizing: border-box;
            text-align: center;
        }

        .footer {
            padding: 24px 16px;
        }

        .footer-links a {
            display: inline-block;
            margin: 4px 8px;
        }
    }
`;
