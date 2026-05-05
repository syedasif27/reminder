import "./globals.css";

export const metadata = {
  title: "RemindMe — Personal Reminder App",
  description: "Your personal reminder app with Telegram notifications",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
