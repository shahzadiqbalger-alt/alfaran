<?php
/**
 * Al Faran Travel & Tours — Contact Form Mailer
 * SMTP: mail.stepwaysoftwares.com:465 (SSL)
 * From: alfaran@stepwaysoftwares.com
 * To:   sales.alfarantravels@gmail.com
 */

// ── Allow only POST ──────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ── CORS (adjust origin as needed) ──────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// ── Load PHPMailer ───────────────────────────────────
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ── Sanitize & validate inputs ───────────────────────
function clean(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$name       = clean($_POST['name']        ?? '');
$phone      = clean($_POST['phone']       ?? '');
$email      = clean($_POST['email']       ?? '');
$destination = clean($_POST['destination'] ?? '');
$travelDate = clean($_POST['travelDate']  ?? '');
$travelers  = clean($_POST['travelers']   ?? '');
$message    = clean($_POST['message']     ?? '');

// Required field check
if ($name === '' || $phone === '' || $email === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Name, phone, and email are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

// ── SMTP Credentials ─────────────────────────────────
define('SMTP_HOST',     'mail.stepwaysoftwares.com');
define('SMTP_PORT',     465);
define('SMTP_USER',     'alfaran@stepwaysoftwares.com');
define('SMTP_PASS',     '(alfaran@12)');   // <-- replace with actual password
define('MAIL_FROM',     'alfaran@stepwaysoftwares.com');
define('MAIL_FROM_NAME','Al Faran Travel & Tours');
define('MAIL_TO',       'sales.alfarantravels@gmail.com');
define('MAIL_TO_NAME',  'Al Faran Sales');

// ── Build email body ─────────────────────────────────
$htmlBody = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: Arial, sans-serif; color: #212529; background: #f8f9fa; margin: 0; padding: 0; }
    .wrap { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0D47A1, #1565C0); padding: 30px 36px; }
    .header h1 { color: #fff; margin: 0; font-size: 1.4rem; }
    .header p  { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 0.88rem; }
    .body { padding: 32px 36px; }
    .row { margin-bottom: 18px; }
    .label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; margin-bottom: 4px; }
    .value { font-size: 1rem; color: #212529; padding: 10px 14px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #D4A017; }
    .message-value { white-space: pre-line; }
    .footer { background: #0d1b2e; padding: 20px 36px; color: rgba(255,255,255,0.5); font-size: 0.8rem; text-align: center; }
  </style>
</head>
<body>
  <div class='wrap'>
    <div class='header'>
      <h1>&#9992; New Consultation Request</h1>
      <p>Submitted via Al Faran Travel &amp; Tours website contact form</p>
    </div>
    <div class='body'>
      <div class='row'>
        <div class='label'>Full Name</div>
        <div class='value'>" . $name . "</div>
      </div>
      <div class='row'>
        <div class='label'>Phone Number</div>
        <div class='value'>" . $phone . "</div>
      </div>
      <div class='row'>
        <div class='label'>Email Address</div>
        <div class='value'><a href='mailto:" . $email . "' style='color:#0D47A1;'>" . $email . "</a></div>
      </div>
      " . ($destination ? "<div class='row'><div class='label'>Destination</div><div class='value'>" . $destination . "</div></div>" : '') . "
      " . ($travelDate  ? "<div class='row'><div class='label'>Travel Date</div><div class='value'>" . $travelDate . "</div></div>" : '') . "
      " . ($travelers   ? "<div class='row'><div class='label'>Number of Travelers</div><div class='value'>" . $travelers . "</div></div>" : '') . "
      " . ($message     ? "<div class='row'><div class='label'>Message</div><div class='value message-value'>" . nl2br($message) . "</div></div>" : '') . "
    </div>
    <div class='footer'>
      Al Faran Travel &amp; Tours &mdash; Your Journey, Our Priority<br>
      0334-3044483 &bull; Gulistan-e-Johar Block 19, Karachi
    </div>
  </div>
</body>
</html>
";

$textBody = "NEW CONSULTATION REQUEST\n"
    . "========================\n"
    . "Name:        $name\n"
    . "Phone:       $phone\n"
    . "Email:       $email\n"
    . ($destination ? "Destination: $destination\n" : '')
    . ($travelDate  ? "Travel Date: $travelDate\n"  : '')
    . ($travelers   ? "Travelers:   $travelers\n"   : '')
    . ($message     ? "\nMessage:\n$message\n"       : '');

// ── Send via PHPMailer ───────────────────────────────
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;   // SSL on port 465
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    // From / To
    $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
    $mail->addAddress(MAIL_TO, MAIL_TO_NAME);

    // Reply-To: visitor's email so you can reply directly
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = "New Consultation Request from $name — Al Faran Travel";
    $mail->Body    = $htmlBody;
    $mail->AltBody = $textBody;

    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Your consultation request has been received. We will contact you within 24 hours.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Mail could not be sent. Please try calling us directly at 0334-3044483.',
        'debug'   => $mail->ErrorInfo   // remove this line on production
    ]);
}
