import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import "./App.css";

// 自定义 Hook：监听元素是否进入视口
function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// 自定义 Hook：打字机效果
function useTypewriter(text: string, speed = 100, delay = 500) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isTyping };
}

// 翻译 Hook
function useTranslation(currentLang: 'en' | 'zh') {
  return useCallback((en: string, zh: string) => currentLang === 'en' ? en : zh, [currentLang]);
}

// 动画卡片组件
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedCard = memo(({ children, className = "", delay = 0 }: AnimatedCardProps) => {
  const { ref, isInView } = useInView<HTMLDivElement>(0.1);

  return (
    <div
      ref={ref}
      className={`${className} ${isInView ? 'animate-in' : 'animate-out'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});

// 价值观卡片组件
interface ValueCardProps {
  icon: string;
  titleEn: string;
  titleZh: string;
  descEn: string;
  descZh: string;
  delay: number;
  t: (en: string, zh: string) => string;
}

const ValueCard = memo(({ icon, titleEn, titleZh, descEn, descZh, delay, t }: ValueCardProps) => {
  const { ref, isInView } = useInView<HTMLDivElement>(0.1);

  return (
    <div
      ref={ref}
      className={`value-card ${isInView ? 'animate-in' : 'animate-out'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="value-icon">{icon}</div>
      <h3>{t(titleEn, titleZh)}</h3>
      <p>{t(descEn, descZh)}</p>
    </div>
  );
});

// 服务卡片组件
interface ServiceCardProps {
  titleEn: string;
  titleZh: string;
  descEn: string;
  descZh: string;
  delay: number;
  t: (en: string, zh: string) => string;
}

const ServiceCard = memo(({ titleEn, titleZh, descEn, descZh, delay, t }: ServiceCardProps) => {
  const { ref, isInView } = useInView<HTMLDivElement>(0.1);

  return (
    <div
      ref={ref}
      className={`service-card ${isInView ? 'animate-in' : 'animate-out'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <h3>{t(titleEn, titleZh)}</h3>
      <p>{t(descEn, descZh)}</p>
    </div>
  );
});

// 粒子背景组件
const ParticleBackground = memo(() => {
  return (
    <div className="particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
});

function App() {
  const [currentLang, setCurrentLang] = useState<'en' | 'zh'>('en');
  const [scrolled, setScrolled] = useState(false);
  const cursorLightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const mousePos = useRef({ x: 0, y: 0 });

  const t = useTranslation(currentLang);

  // 打字机效果
  const subtitleText = useMemo(() => 
    t('Smart Tech · Intelligent Technology · Minimalist Code', '智能科技 · 智能技术 · 极简代码'),
  [t]);
  const { displayText, isTyping } = useTypewriter(subtitleText, 50, 800);

  // 优化鼠标光效 - 使用 requestAnimationFrame
  useEffect(() => {
    const updateCursor = () => {
      if (cursorLightRef.current) {
        cursorLightRef.current.style.left = `${mousePos.current.x}px`;
        cursorLightRef.current.style.top = `${mousePos.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    rafRef.current = requestAnimationFrame(updateCursor);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 滚动监听 - 使用 passive 事件
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = useCallback(() => {
    setCurrentLang(prev => prev === 'en' ? 'zh' : 'en');
  }, []);

  // 价值观数据
  const values = useMemo(() => [
    { icon: '⚡', titleEn: 'Smart Tech', titleZh: '智能科技', descEn: 'Leveraging AI and modern technology to solve complex problems', descZh: '利用人工智能和现代技术解决复杂问题' },
    { icon: '🎯', titleEn: 'Intelligent Solutions', titleZh: '智能方案', descEn: 'Data-driven insights for smarter decision making', descZh: '数据驱动的洞察，助力更明智的决策' },
    { icon: '🚀', titleEn: 'Minimalist Code', titleZh: '极简代码', descEn: 'Clean, efficient, and maintainable code architecture', descZh: '简洁、高效、可维护的代码架构' },
  ], []);

  // 服务数据
  const services = useMemo(() => [
    { titleEn: 'AI Development', titleZh: 'AI 开发', descEn: 'Custom AI solutions and machine learning models', descZh: '定制化 AI 解决方案和机器学习模型' },
    { titleEn: 'Cloud Architecture', titleZh: '云架构', descEn: 'Scalable cloud infrastructure design', descZh: '可扩展的云基础设施设计' },
    { titleEn: 'Web Applications', titleZh: 'Web 应用', descEn: 'Modern web apps with cutting-edge technology', descZh: '采用前沿技术的现代化 Web 应用' },
    { titleEn: 'Consulting', titleZh: '技术咨询', descEn: 'Strategic technology consulting services', descZh: '战略技术咨询服务' },
  ], []);

  // 代码打字机效果
//   const codeLines = useMemo(() => [
//     { text: 'const stcod = {', className: '' },
//     { text: '  innovate: () => "Smart Solutions",', className: 'indent' },
//     { text: '  create: () => "Clean Code",', className: 'indent' },
//     { text: '  deliver: () => "Excellence"', className: 'indent' },
//     { text: '};', className: '' },
//   ], []);

  return (
    <>
      <div ref={cursorLightRef} className="cursor-light" />

      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="container nav-container">
          <div className="logo">
            <span className="logo-text">stcod</span>
            <span className="logo-dot">.</span>
          </div>
          <button
            className={`lang-switch lang-${currentLang}`}
            onClick={toggleLang}
            aria-label={t('Switch language', '切换语言')}
          >
            <div className="lang-toggle" />
            <div className="lang-text">
              <span className="lang-text-en">EN</span>
              <span className="lang-text-zh">中</span>
            </div>
          </button>
        </div>
      </nav>

      <section className="hero">
        <ParticleBackground />
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-main">stcod</span>
            <span className="title-dot">.</span>
          </h1>
          <p className="hero-subtitle">
            {displayText}
            <span className={`cursor ${isTyping ? 'blink' : ''}`}>|</span>
          </p>
          <div className="hero-cta">
            <a href="#services" className="cta-button">
              {t('Explore Services', '探索服务')}
            </a>
            <a href="#contact" className="cta-button secondary">
              {t('Contact Us', '联系我们')}
            </a>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel" />
          </div>
          <span>{t('Scroll', '滚动')}</span>
        </div>
      </section>

      <section className="values" id="values">
        <div className="container">
          <AnimatedCard className="section-title-wrapper">
            <h2 className="section-title">{t('Core Values', '核心理念')}</h2>
            <p className="section-subtitle">
              {t('What drives us forward', '驱动我们前进的力量')}
            </p>
          </AnimatedCard>
          <div className="values-grid">
            {values.map((value, index) => (
              <ValueCard
                key={value.titleEn}
                {...value}
                delay={index * 100}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="container">
          <AnimatedCard className="section-title-wrapper">
            <h2 className="section-title">{t('Our Services', '主打内容')}</h2>
            <p className="section-subtitle">
              {t('Solutions tailored for your success', '为您量身定制的解决方案')}
            </p>
          </AnimatedCard>
          <div className="services-grid">
            {services.map((service, index) => (
              <ServiceCard
                key={service.titleEn}
                {...service}
                delay={index * 100}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="code-showcase" id="code">
        <div className="container">
          <AnimatedCard className="section-title-wrapper">
            <h2 className="section-title">{t('Clean Code Philosophy', '简洁代码理念')}</h2>
          </AnimatedCard>
          <div className="code-block-wrapper">
            <div className="code-header">
              <div className="code-dot red" />
              <div className="code-dot yellow" />
              <div className="code-dot green" />
              <span className="code-filename">stcod.js</span>
            </div>
            <div className="code-block">
              <div className="code-line">
                <span className="keyword">const</span>{' '}
                <span className="variable">stcod</span> = {'{'}
              </div>
              <div className="code-line indent">
                <span className="function">innovate</span>: () {'=>'}{' '}
                <span className="string">"Smart Solutions"</span>,
              </div>
              <div className="code-line indent">
                <span className="function">create</span>: () {'=>'}{' '}
                <span className="string">"Clean Code"</span>,
              </div>
              <div className="code-line indent">
                <span className="function">deliver</span>: () {'=>'}{' '}
                <span className="string">"Excellence"</span>
              </div>
              <div className="code-line">{'}'};</div>
            </div>
          </div>
          <p className="code-description">
            {t('We believe in writing code that is not just functional, but elegant.', '我们坚信代码不仅要功能完善，更要优雅简洁。')}
          </p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-wrapper">
          <AnimatedCard>
            <div className="contact-label">
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {t('Get in Touch', '联系我们')}
            </div>
            <a href="mailto:hello@stcod.com" className="contact-email">
              hello@stcod.com
            </a>
          </AnimatedCard>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">stcod<span>.</span></div>
            <p className="footer-text">
              © {new Date().getFullYear()} stcod | {t('Smart Tech · Clean Code', '智能科技 · 极简代码')}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
