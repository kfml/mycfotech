document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initNavbarMenu();
    initMobileMenu();
    initMediaTabs();
    initSearchOverlay();
    initBackToTop();
    initImageLoading();
    initScrollAnimations();
});

function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    const scrollThreshold = 100;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll <= 0) {
            header.classList.remove('is-hidden');
            header.classList.add('is-visible');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
            header.classList.remove('is-visible');
            header.classList.add('is-hidden');
        } else {
            header.classList.remove('is-hidden');
            header.classList.add('is-visible');
        }
        
        lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
}

function initNavbarMenu() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const config = window.publiiThemeMenuConfig || {
        isHoverMenu: true,
        submenuWidth: 'auto'
    };
    
    const submenuParents = navbar.querySelectorAll('.has-submenu');
    
    submenuParents.forEach(function(parent) {
        const submenu = parent.querySelector('.navbar__submenu');
        if (!submenu) return;
        
        const handleSubmenu = function() {
            if (window.innerWidth <= 56.1875 * 16) return;
            
            const parentRect = parent.getBoundingClientRect();
            const submenuWidth = config.submenuWidth === 'auto' ? submenu.clientWidth : parseInt(config.submenuWidth);
            
            // Check if this is a top-level menu item or nested
            const isTopLevel = parent.parentNode.classList.contains('navbar__menu');
            
            if (isTopLevel) {
                // Top-level menu - check if it fits on right or needs to go left
                if (parentRect.left + submenuWidth * 2 > window.innerWidth) {
                    submenu.classList.remove('is-left-submenu');
                    submenu.classList.add('is-right-submenu');
                    submenu.style.left = 'auto';
                    submenu.style.right = '0';
                } else {
                    submenu.classList.remove('is-right-submenu');
                    submenu.classList.add('is-left-submenu');
                    submenu.style.left = '0';
                    submenu.style.right = 'auto';
                }
            } else {
                // Nested submenu - always open to the right
                submenu.classList.remove('is-right-submenu');
                submenu.classList.add('is-left-submenu');
                submenu.style.left = '100%';
                submenu.style.right = 'auto';
                submenu.style.marginLeft = '0.5rem';
            }
            
            submenu.setAttribute('aria-hidden', 'false');
            const sep = parent.querySelector('.is-separator');
            if (sep) sep.setAttribute('aria-expanded', 'true');
        };
        
        const hideSubmenu = function() {
            if (window.innerWidth <= 56.1875 * 16) return;
            
            submenu.removeAttribute('style');
            submenu.setAttribute('aria-hidden', 'true');
            const sep = parent.querySelector('.is-separator');
            if (sep) sep.setAttribute('aria-expanded', 'false');
        };
        
        if (config.isHoverMenu) {
            parent.addEventListener('mouseenter', handleSubmenu);
            parent.addEventListener('mouseleave', hideSubmenu);
        }
        
        parent.addEventListener('click', function(e) {
            if (window.innerWidth <= 56.1875 * 16) return;
            handleSubmenu();
        });
        
        parent.addEventListener('focusin', handleSubmenu);
        
        parent.addEventListener('focusout', function(e) {
            setTimeout(function() {
                if (!parent.contains(document.activeElement)) {
                    hideSubmenu();
                }
            }, 0);
        });
    });
    
    const separators = navbar.querySelectorAll('.navbar__menu > .has-submenu > .is-separator');
    separators.forEach(function(sep) {
        if (!sep.hasAttribute('tabindex')) {
            sep.setAttribute('tabindex', '0');
            sep.setAttribute('role', 'button');
        }
    });
}

function initMobileMenu() {
    const toggle = document.querySelector('.js-toggle');
    const navbar = document.querySelector('.js-navbar');
    
    if (!toggle || !navbar) return;
    
    const menu = navbar.querySelector('.navbar__menu');
    let sidebar = document.querySelector('.navbar_mobile_sidebar');
    let menuInSidebar = false;
    
    const config = window.publiiThemeMenuConfig || {
        mobileMenuMode: 'sidebar',
        mobileMenuExpandableSubmenus: true,
        animationSpeed: 300
    };
    
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.className = 'navbar_mobile_sidebar is-hidden';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-menu-close';
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeBtn.addEventListener('click', function() {
            closeMobileMenu();
        });
        sidebar.appendChild(closeBtn);
        
        document.body.appendChild(sidebar);
    } else {
        menuInSidebar = sidebar.contains(menu);
    }
    
    const closeMobileMenu = function() {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('is-active');
        sidebar.classList.add('is-hidden');
        sidebar.classList.remove('is-active');
        document.body.classList.remove('navbar-mobile-active');
        document.documentElement.classList.remove('no-scroll');
    };
    
    const openMobileMenu = function() {
        if (!menuInSidebar) {
            sidebar.appendChild(menu);
            menuInSidebar = true;
        }
        sidebar.classList.remove('is-hidden');
        sidebar.classList.add('is-active');
        document.body.classList.add('navbar-mobile-active');
        document.documentElement.classList.add('no-scroll');
    };
    
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        toggle.classList.toggle('is-active');
        
        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    document.addEventListener('click', function(e) {
        if (document.body.classList.contains('navbar-mobile-active')) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
    
    if (config.mobileMenuExpandableSubmenus) {
        const submenuParents = sidebar.querySelectorAll('.has-submenu');
        submenuParents.forEach(function(parent) {
            const separator = parent.querySelector('.is-separator');
            const submenu = parent.querySelector('.navbar__submenu');
            if (!separator || !submenu) return;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'navbar__submenu_wrapper';
            parent.insertBefore(wrapper, submenu);
            wrapper.appendChild(submenu);
            
            separator.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = separator.getAttribute('aria-expanded') === 'true';
                
                if (isExpanded) {
                    submenu.style.height = submenu.clientHeight + 'px';
                    setTimeout(function() {
                        submenu.style.height = '0px';
                    }, 0);
                    setTimeout(function() {
                        submenu.removeAttribute('style');
                        wrapper.classList.remove('is-active');
                    }, config.animationSpeed);
                    submenu.setAttribute('aria-hidden', 'true');
                    separator.setAttribute('aria-expanded', 'false');
                } else {
                    wrapper.classList.add('is-active');
                    submenu.style.height = '0px';
                    submenu.style.overflow = 'hidden';
                    const height = submenu.querySelector('ul').clientHeight;
                    setTimeout(function() {
                        submenu.style.height = height + 'px';
                    }, 0);
                    setTimeout(function() {
                        submenu.removeAttribute('style');
                    }, config.animationSpeed);
                    submenu.setAttribute('aria-hidden', 'false');
                    separator.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }
}

function initMediaTabs() {
    const mediaTabsSections = document.querySelectorAll('.media-tabs');
    
    mediaTabsSections.forEach(function(section) {
        const tabs = section.querySelectorAll('.media-tabs__nav__tab');
        const panels = section.querySelectorAll('.media-tabs__item');
        
        if (tabs.length === 0 || panels.length === 0) return;
        
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                const targetId = tab.getAttribute('aria-controls');
                const targetPanel = section.querySelector('#' + targetId);
                
                if (!targetPanel) return;
                
                tabs.forEach(function(t) {
                    t.classList.remove('media-tabs__nav__tab--active');
                    t.setAttribute('aria-selected', 'false');
                    t.setAttribute('tabindex', '-1');
                });
                
                panels.forEach(function(p) {
                    p.classList.remove('media-tabs__item--active');
                });
                
                tab.classList.add('media-tabs__nav__tab--active');
                tab.setAttribute('aria-selected', 'true');
                tab.setAttribute('tabindex', '0');
                targetPanel.classList.add('media-tabs__item--active');
                
                const video = targetPanel.querySelector('video');
                if (video) {
                    initVideoControls(video);
                }
            });
        });
    });
    
    const videos = document.querySelectorAll('.lazy-video');
    videos.forEach(function(video) {
        initVideoControls(video);
    });
}

function initVideoControls(video) {
    if (!video) return;
    
    const source = video.querySelector('source');
    if (source && source.dataset.src) {
        source.src = source.dataset.src;
        video.load();
        video.classList.remove('lazy-video');
    }
    
    const controls = video.parentElement.querySelector('.media-tabs__controls');
    if (!controls) return;
    
    const playBtn = controls.querySelector('.play-button');
    const pauseBtn = controls.querySelector('.pause-button');
    const resumeBtn = controls.querySelector('.resume-button');
    
    if (playBtn) {
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            video.play();
            video.classList.add('playing');
            video.classList.remove('paused');
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            video.pause();
            video.classList.remove('playing');
            video.classList.add('paused');
        });
    }
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            video.play();
            video.classList.add('playing');
            video.classList.remove('paused');
        });
    }
    
    video.addEventListener('ended', function() {
        video.classList.remove('playing');
        video.classList.remove('paused');
    });
    
    if (window.mediaTabsConfig && window.mediaTabsConfig.pauseOtherInstancesOnPlay) {
        video.addEventListener('play', function() {
            document.querySelectorAll('video').forEach(function(v) {
                if (v !== video) {
                    v.pause();
                    v.classList.remove('playing');
                    v.classList.add('paused');
                }
            });
        });
    }
}

function initSearchOverlay() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    
    if (!searchToggle || !searchOverlay) return;
    
    const closeSearch = function() {
        searchOverlay.classList.remove('expanded');
        searchOverlay.classList.remove('is-active');
        searchToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    
    const openSearch = function() {
        searchOverlay.classList.add('expanded');
        searchOverlay.classList.add('is-active');
        searchToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        setTimeout(function() {
            const input = searchOverlay.querySelector('.search__input');
            if (input) {
                input.focus();
            }
        }, 100);
    };
    
    searchToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (searchOverlay.classList.contains('expanded')) {
            closeSearch();
        } else {
            openSearch();
        }
    });
    
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay.classList.contains('expanded')) {
            closeSearch();
        }
        
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (searchOverlay.classList.contains('expanded')) {
                closeSearch();
            } else {
                openSearch();
            }
        }
    });
}

function initBackToTop() {
    const bttop = document.getElementById('backToTop');
    
    if (!bttop) return;
    
    const updateProgress = function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
        const circle = bttop.querySelector('.bttop__progress-indicator');
        
        if (circle) {
            const circumference = 2 * Math.PI * 22;
            const offset = circumference * (1 - scrollPercent);
            circle.style.strokeDashoffset = offset;
        }
    };
    
    const handleScroll = function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            bttop.classList.add('is-visible');
        } else {
            bttop.classList.remove('is-visible');
        }
        
        updateProgress();
    };
    
    bttop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

function initImageLoading() {
    const images = document.querySelectorAll('img[loading]');
    
    images.forEach(function(img) {
        if (img.complete) {
            img.classList.add('is-loaded');
        } else {
            img.addEventListener('load', function() {
                img.classList.add('is-loaded');
            }, false);
            
            img.addEventListener('error', function() {
                img.classList.add('is-loaded');
            }, false);
        }
    });
}

function initScrollAnimations() {
    const heroSection = document.querySelector('.hero');
    
    if (!heroSection) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    observer.observe(heroSection);
}
