# Lab Service System

A modern web application for managing lab services, customers, and invoice generation. This system provides a comprehensive solution for laboratory service management with a beautiful, responsive interface.

## Features

- **Dashboard**: Overview of system statistics and recent activities
- **Invoice Management**: Create, view, and manage invoices
- **Customer Management**: Store and manage customer information
- **Service Management**: Define and manage lab services
- **Configuration**: System settings management (similar to Google Sheets Config)
- **Template Management**: Customizable invoice templates
- **Modern UI**: Beautiful, responsive design with your preferred theme colors

## Theme Colors

- **Primary**: #06A764 (Green)
- **Secondary**: #013F81 (Blue)
- **Background**: #FFFFFF (White)
- **Text**: Black and White

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **PDF Generation**: jsPDF with html2canvas
- **Storage**: Local Storage (can be easily replaced with database)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lab-service-system
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── config/            # Configuration page
│   ├── customers/         # Customer management
│   ├── invoices/          # Invoice management
│   ├── services/          # Service management
│   ├── templates/         # Template management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utility functions
│   ├── storage.ts        # Data storage utilities
│   └── utils.ts          # General utilities
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Configuration

The system includes a configuration page that allows you to manage:

- **Main Folder ID**: Your Google Drive folder ID
- **Template Invoice ID**: Your invoice template file ID
- **Default Due Days**: Default payment terms
- **Admin Email**: System administrator email
- **Invoice Prefix**: Custom prefix for invoice numbers

### How to Find IDs

#### Main Folder ID
1. Go to your Google Drive
2. Navigate to your Lab-Service-System folder
3. Copy the ID from the URL: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`

#### Template Invoice ID
1. Open your invoice template Google Docs file
2. Copy the ID from the URL: `https://docs.google.com/document/d/YOUR_FILE_ID/edit`

## Usage

### Dashboard
- View system statistics
- Quick access to common actions
- Recent invoices overview

### Invoices
- Create new invoices
- View and edit existing invoices
- Generate PDF invoices
- Track payment status

### Customers
- Add new customers
- Manage customer information
- View customer history

### Services
- Define lab services
- Set pricing
- Categorize services

### Templates
- Create custom invoice templates
- Manage template content
- Set default templates

## Data Storage

Currently, the system uses browser localStorage for data persistence. This can be easily replaced with:

- Database (PostgreSQL, MySQL, MongoDB)
- Cloud storage (Firebase, Supabase)
- API integration

## Customization

### Adding New Features
1. Create new components in `components/`
2. Add new pages in `app/`
3. Update types in `types/index.ts`
4. Add storage functions in `lib/storage.ts`

### Styling
- Modify `tailwind.config.js` for theme changes
- Update `app/globals.css` for global styles
- Use the existing UI components for consistency

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**Note**: This system is designed to be a modern replacement for Google Apps Script-based solutions, providing better user experience and more flexibility for customization.
