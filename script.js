// Initialize EmailJS (replace with your actual User ID)
(function() {
    emailjs.init("VfAE0n8rDUmJ6p_pU"); // Replace with your actual EmailJS User ID
})();

// Company contact (set from user)
const COMPANY_EMAIL = 'edmundessel.18@gmail.com';
const COMPANY_PHONE = '+233209021158'; // Original company phone
const WHATSAPP_BUSINESS_NUMBER = '233275329918'; // WhatsApp Business number (233 format)

// WhatsApp behavior: true = open prefilled WhatsApp chat after booking submission (client-side opener)
// Note: This requires the customer to actually send the message from their device. For fully automated sends
// you need a server-side WhatsApp Business API or a provider like Twilio (requires credentials).
const ENABLE_WHATSAPP_AUTO = true;

/**
 * Format phone for wa.me links: remove non-digits, replace leading 0 with country code 233 if present.
 * Example: '+233209021158' -> '233209021158', '0209021158' -> '233209021158'
 */
function formatWhatsAppPhone(phone) {
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0')) {
        // assume national number like 020... convert to 23320...
        digits = '233' + digits.slice(1);
    }
    // Ensure it doesn't start with duplicate country code
    if (digits.startsWith('00')) digits = digits.replace(/^00+/, '');
    return digits;
}

function sendWhatsAppOpener(data) {
    if (!ENABLE_WHATSAPP_AUTO) return;
    const waPhone = WHATSAPP_BUSINESS_NUMBER; // Use the WhatsApp Business number
    if (!waPhone) return;

    const lines = [
        'New booking request from website:',
        `Vehicle: ${data.carName || 'N/A'} (${data.carYear || ''})`,
        `Name: ${data.customerName || 'N/A'}`,
        `Phone: ${data.customerNumber || 'N/A'}`,
        `Email: ${data.customerEmail || 'Not provided'}`,
        `Date: ${data.bookingDate || 'N/A'}`,
        `Duration (days): ${data.duration || 'N/A'}`,
    ];

    const message = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${waPhone}?text=${message}`;

    // Open WhatsApp Web or prompt on mobile. Do not block UI; open in new tab/window.
    try {
        window.open(url, '_blank');
    } catch (e) {
        console.warn('Unable to open WhatsApp link:', e);
    }
}

// Add interactivity to rent buttons
document.querySelectorAll('.rent-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get car details from data attributes
        const carName = this.getAttribute('data-car');
        const carYear = this.getAttribute('data-year');
        
        // Store car details for later use
        sessionStorage.setItem('bookingCarName', carName);
        sessionStorage.setItem('bookingCarYear', carYear);
        
        // Show booking form modal
        document.getElementById('form-car-name').textContent = `${carName} (${carYear})`;
        document.getElementById('bookingForm').reset(); // Clear previous entries
        
        document.getElementById('bookingFormModal').style.display = 'block';
    });
});

// Handle form submission
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const bookingData = {
        carName: sessionStorage.getItem('bookingCarName'),
        carYear: sessionStorage.getItem('bookingCarYear'),
        customerName: formData.get('customerName'),
        customerNumber: formData.get('customerNumber'),
        customerEmail: formData.get('customerEmail') || '',
        bookingDate: formData.get('bookingDate'),
        duration: formData.get('duration'),
        timestamp: new Date().toLocaleString('en-GH', {
            timeZone: 'Africa/Accra',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    };
    
    // Send email notification using EmailJS
    sendBookingEmail(bookingData);
    
    // Show confirmation modal
    document.getElementById('confirm-car-name').textContent = bookingData.carName;
    document.getElementById('confirm-customer-name').textContent = bookingData.customerName;
    document.getElementById('confirm-date').textContent = bookingData.bookingDate;
    document.getElementById('confirm-duration').textContent = bookingData.duration;
    
    document.getElementById('bookingFormModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'block';
    // Open WhatsApp chat with a prefilled message to the company (client-side opener)
    try { sendWhatsAppOpener(bookingData); } catch (e) { console.warn('WhatsApp opener failed', e); }
});

// Function to send booking email using EmailJS
function sendBookingEmail(data) {
    // EmailJS parameters object
    const templateParams = {
        // These keys should match the variable names in your EmailJS template
        to_email: COMPANY_EMAIL,
        company_phone: COMPANY_PHONE,
        car_name: data.carName,
        car_year: data.carYear,
        customer_name: data.customerName,
        customer_number: data.customerNumber,
        customer_email: data.customerEmail || 'Not provided',
        booking_date: data.bookingDate,
        duration: data.duration,
        timestamp: data.timestamp,
        reply_to: data.customerNumber,
        message: `New Booking Request:\n\nCar: ${data.carName} (${data.carYear})\nCustomer: ${data.customerName}\nPhone: ${data.customerNumber}\nEmail: ${data.customerEmail || 'Not provided'}\nBooking Date: ${data.bookingDate}\nDuration: ${data.duration} days\nTime: ${data.timestamp}`
    };

    // Replace these with your actual EmailJS IDs (set them when you have them)
    const SERVICE_ID = 'service_d1mqgah'; // Replace with your EmailJS Service ID
    const TEMPLATE_ID = 'template_etl_booking'; // Replace with your EmailJS Template ID
    const USER_ID = 'VfAE0n8rDUmJ6p_pU'; // Replace with your EmailJS User ID

    const usingPlaceholders = (SERVICE_ID === 'service_d1mqgah' || TEMPLATE_ID === 'template_etl_booking' || USER_ID === 'VfAE0n8rDUmJ6p_pU');

    // If EmailJS is configured (not using obvious placeholders), attempt to send. Otherwise, save fallback locally.
    if (!usingPlaceholders && typeof emailjs !== 'undefined' && emailjs.send) {
        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
            .then(function(response) {
                console.log('Booking email sent successfully!', response);
                showNotification('Booking email sent successfully.', 'success');
            })
                .catch(function(error) {
                    console.error('Failed to send booking email:', error);
                    showNotification(`Booking received! We will contact you shortly. If you don't hear from us within 2 hours please call ${COMPANY_PHONE}.`, 'error');
                    saveBookingFallback(data);
                });
    } else {
            console.warn('EmailJS not configured or using placeholder IDs. Saving booking locally.');
            showNotification(`Booking recorded locally (Email sending not configured). Call ${COMPANY_PHONE} to follow up.`, 'info');
        saveBookingFallback(data);
    }

    // Save booking data to localStorage as a fallback so admin can retrieve pending bookings
    function saveBookingFallback(fallbackData) {
        try {
            const key = 'etl_pending_bookings';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(Object.assign({ savedAt: new Date().toISOString() }, fallbackData));
            localStorage.setItem(key, JSON.stringify(existing));
            console.log('Saved booking fallback to localStorage, total pending:', existing.length);
        } catch (e) {
            console.error('Failed to save booking fallback:', e);
        }
    }
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffa500' : '#4CAF50'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-size: 14px;
        z-index: 10000;
        max-width: 400px;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 5000);
}

// Close modal functions
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});

document.querySelectorAll('.close, .modal-button').forEach(btn => {
    btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
    });
});

// Admin modal handlers: view/export/clear pending bookings saved in localStorage
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const adminBookingsList = document.getElementById('adminBookingsList');
const adminExportBtn = document.getElementById('adminExportBtn');
const adminClearBtn = document.getElementById('adminClearBtn');
const adminCloseBtn = document.getElementById('adminCloseBtn');
const adminCloseX = document.getElementById('adminClose');

function openAdminModal() {
    if (!adminModal) return;
    renderPendingBookings();
    adminModal.style.display = 'block';
}

function closeAdminModal() {
    if (!adminModal) return;
    adminModal.style.display = 'none';
}

function renderPendingBookings() {
    if (!adminBookingsList) return;
    const data = JSON.parse(localStorage.getItem('etl_pending_bookings') || '[]');
    if (!data.length) {
        adminBookingsList.innerHTML = '<p>No pending bookings.</p>';
        return;
    }

    adminBookingsList.innerHTML = data.map((b, i) => {
        const safe = (v) => String(v || '').replace(/</g, '<').replace(/>/g, '>');
        return `
            <div style="border:1px solid #eee;padding:10px;margin-bottom:8px;border-radius:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <strong>${safe(b.carName)} (${safe(b.carYear)})</strong>
                    <small>${safe(b.savedAt || b.timestamp || '')}</small>
                </div>
                <div style="margin-top:6px;">
                    <div><strong>Customer:</strong> ${safe(b.customerName)}</div>
                    <div><strong>Phone:</strong> ${safe(b.customerNumber)}</div>
                    <div><strong>Email:</strong> ${safe(b.customerEmail)}</div>
                    <div><strong>Date:</strong> ${safe(b.bookingDate)} &nbsp; <strong>Days:</strong> ${safe(b.duration)}</div>
                </div>
                <div style="margin-top:8px;text-align:right">
                    <button data-index="${i}" class="admin-delete-btn modal-button">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    // Attach delete handlers
    adminBookingsList.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = Number(this.getAttribute('data-index'));
            deletePendingBooking(idx);
        });
    });
}

function deletePendingBooking(index) {
    const key = 'etl_pending_bookings';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (index >= 0 && index < existing.length) {
        existing.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(existing));
        renderPendingBookings();
        showNotification('Pending booking deleted.', 'info');
    }
}

function exportPendingBookings() {
    const key = 'etl_pending_bookings';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const blob = new Blob([JSON.stringify(existing, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending_bookings_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function clearPendingBookings() {
    if (!confirm('Clear all pending bookings? This cannot be undone.')) return;
    localStorage.removeItem('etl_pending_bookings');
    renderPendingBookings();
    showNotification('All pending bookings cleared.', 'info');
}

if (adminBtn) adminBtn.addEventListener('click', openAdminModal);
if (adminExportBtn) adminExportBtn.addEventListener('click', exportPendingBookings);
if (adminClearBtn) adminClearBtn.addEventListener('click', clearPendingBookings);
if (adminCloseBtn) adminCloseBtn.addEventListener('click', closeAdminModal);
if (adminCloseX) adminCloseX.addEventListener('click', closeAdminModal);

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Highlight active navigation link
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
});

// Simple animation for elements on page load
document.addEventListener('DOMContentLoaded', function() {
    // Animate section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.style.opacity = '0';
        title.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            title.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
        }, 100);
    });

    // Animate service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });

    // Animate car cards
    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 600 + (index * 100));
    });
});