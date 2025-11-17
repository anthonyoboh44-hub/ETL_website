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

// Handle booking form submission - Send directly to WhatsApp
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const customerName = formData.get('customerName');
    const customerNumber = formData.get('customerNumber');
    const bookingDate = formData.get('bookingDate');
    const duration = formData.get('duration');
    const carName = sessionStorage.getItem('bookingCarName');
    const carYear = sessionStorage.getItem('bookingCarYear');
    
    // Construct the WhatsApp message with proper URL encoding
    const message = `Hello ETL Car Rentals!%0A%0AI would like to book a vehicle:%0A%0A*Vehicle:* ${carName} (${carYear})%0A*Full Name:* ${customerName}%0A*Phone Number:* ${customerNumber}%0A*Booking Date:* ${bookingDate}%0A*Duration:* ${duration} days%0A%0AThank you!`;
    
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/233275329918?text=${message}`, '_blank');
    
    // Close the booking modal
    document.getElementById('bookingFormModal').style.display = 'none';
    
    // Optional: Show a simple alert to confirm action
    alert('Your booking request has been sent! We will contact you shortly via WhatsApp.');
});

// Handle contact form submission - Send directly to WhatsApp
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Construct the WhatsApp message with proper URL encoding
    const whatsappMessage = `Hello ETL Car Rentals!%0A%0AI would like to get in touch:%0A%0A*Full Name:* ${name}%0A*Email:* ${email}%0A*Phone:* ${phone}%0A*Subject:* ${subject}%0A*Message:* ${message}%0A%0AThank you!`;
    
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/233275329918?text=${whatsappMessage}`, '_blank');
    
    // Reset the form
    this.reset();
    
    // Optional: Show a simple alert to confirm action
    alert('Your message has been sent! We will contact you shortly via WhatsApp.');
});

// Close modal functions
document.querySelectorAll('.modal .close, #closeModalBtn, #adminClose, #adminCloseBtn').forEach(btn => {
    btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Click outside modal to close
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});

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
