const IMAGES = [
    './images/bune/33.jpg',
    './images/bune/2.jpg',
    './images/bune/3.jpg',
    './images/bune/4.jpg',
    './images/bune/55.jpg',
    './images/bune/444.jpg',
    './images/bune/gal4.jpg',
    './images/bune/go3.jpg'
];
const AUTOPLAY_DELAY = 5000;
const ANIMATION_DURATION = 0.5;

class Carousel {
    constructor(container, images) {
        this.container = container;
        this.images = images;
        this.currentIndex = 0;
        this.slides = [];
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        console.log('Initializing carousel with images:', this.images);
        this.createSlides();
        this.positionSlides();
    }
    
    createSlides() {
        console.log('Creating slides...');
        this.slides = this.images.map((src, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Slide ${index + 1}`;
            
            // Add error handling for image loading
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
            };
            img.onload = () => {
                console.log(`Successfully loaded image: ${src}`);
            };
            
            slide.appendChild(img);
            this.container.appendChild(slide);
            
            return slide;
        });
    }
    
    positionSlides() {
        this.slides.forEach((slide, index) => {
            const order = this.getOrder(index);
            this.setSlidePosition(slide, order);
            
            // Update active state
            if (order === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }
    
    getOrder(index) {
        const diff = (index - this.currentIndex + this.images.length) % this.images.length;
        if (diff === 0) return 0;
        if (diff === 1) return 1;
        if (diff === this.images.length - 1) return -1;
        return 2;
    }
    
    setSlidePosition(slide, order) {
        gsap.to(slide, {
            duration: ANIMATION_DURATION,
            x: `${order * 65}%`,
            scale: order === 0 ? 1 : 0.75,
            opacity: Math.abs(order) <= 1 ? 1 : 0,
            zIndex: order === 0 ? 2 : 1,
            ease: 'power2.inOut'
        });
    }
    
    move(direction) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        if (direction === 'next') {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        }
        
        this.positionSlides();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, ANIMATION_DURATION * 1000);
    }
    
    goTo(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.isAnimating = true;
        this.currentIndex = index;
        this.positionSlides();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, ANIMATION_DURATION * 1000);
    }
}

class Indicators {
    constructor(container, count, onChange) {
        this.container = container;
        this.count = count;
        this.onChange = onChange;
        this.indicators = [];
        
        this.init();
    }
    
    init() {
        for (let i = 0; i < this.count; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'indicator';
            indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
            
            indicator.addEventListener('click', () => this.onChange(i));
            
            this.indicators.push(indicator);
            this.container.appendChild(indicator);
        }
        
        this.setActive(0);
    }
    
    setActive(index) {
        this.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.getElementById('carouselContainer');
    const carousel = new Carousel(carouselContainer, IMAGES);

    // Initialize indicators
    const indicatorsContainer = document.getElementById('indicators');
    const indicators = new Indicators(indicatorsContainer, IMAGES.length, (index) => {
        carousel.goTo(index);
        indicators.setActive(index);
    });

    // Add button event listeners
    document.getElementById('prevButton').addEventListener('click', () => {
        carousel.move('prev');
        indicators.setActive(carousel.currentIndex);
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        carousel.move('next');
        indicators.setActive(carousel.currentIndex);
    });

    // Setup autoplay
    setInterval(() => {
        carousel.move('next');
        indicators.setActive(carousel.currentIndex);
    }, AUTOPLAY_DELAY);
});
