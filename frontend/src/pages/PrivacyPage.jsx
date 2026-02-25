import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Lock, Mail, UserCheck, Trash2, Download, Server, BarChart2 } from 'lucide-react';
import { pageVariants, fadeInUp } from '../utils/animations';

const Section = ({ icon: Icon, iconColor = 'text-violet-400', title, children }) => (
    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 print:border-gray-300 print:rounded-none print:p-0 print:mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
            {Icon && <Icon className={`${iconColor} print:hidden`} size={20} />}
            {title}
        </h2>
        {children}
    </section>
);

const Bullet = ({ children }) => (
    <li className="flex items-start gap-2">
        <span className="text-violet-400 mt-1 print:text-black">•</span>
        <span className="text-slate-300 print:text-black">{children}</span>
    </li>
);

const PrivacyPage = () => {
    const contentRef = useRef(null);

    const handleDownload = () => {
        window.print();
    };

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #privacy-content, #privacy-content * { visibility: visible; }
                    #privacy-content {
                        position: absolute;
                        left: 0; top: 0;
                        width: 100%;
                        color: black;
                        background: white;
                        font-family: sans-serif;
                        padding: 2cm;
                    }
                    .print\\:hidden { display: none !important; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <motion.div
                className="min-h-screen pt-24 pb-16"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/10 rounded-2xl mb-6">
                            <Shield className="text-violet-400" size={32} />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Политика конфиденциальности</h1>
                        <p className="text-slate-400 mb-6">Дата последнего обновления: февраль 2026</p>
                        <button
                            onClick={handleDownload}
                            className="no-print inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm transition-colors cursor-pointer"
                        >
                            <Download size={16} />
                            Скачать PDF
                        </button>
                    </motion.div>

                    {/* Content */}
                    <motion.div variants={fadeInUp} className="space-y-6" id="privacy-content" ref={contentRef}>

                        <div className="print:block hidden">
                            <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '4px'}}>Политика конфиденциальности GitJob</h1>
                            <p style={{color: '#555', marginBottom: '24px'}}>Дата последнего обновления: февраль 2026</p>
                        </div>

                        <Section icon={Eye} title="Введение">
                            <p className="text-slate-300 leading-relaxed print:text-black">
                                GitJob («мы», «платформа») — это агрегатор IT-вакансий в Казахстане, доступный по адресу{' '}
                                <span className="text-violet-400 print:text-black font-mono">gitjob.su</span>.
                                Настоящая политика конфиденциальности объясняет, какие данные мы собираем,
                                для чего используем и как вы можете управлять своей информацией.
                                Используя платформу, вы соглашаетесь с условиями данной политики.
                            </p>
                        </Section>

                        <Section icon={Database} iconColor="text-blue-400" title="Какие данные мы собираем">
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-white font-medium mb-2 print:text-black">Данные аккаунта (при регистрации)</h3>
                                    <ul className="space-y-2">
                                        <Bullet><strong>Email и имя пользователя</strong> — используются для входа и идентификации</Bullet>
                                        <Bullet><strong>Пароль</strong> — хранится только в хешированном виде (bcrypt). Исходный пароль нам недоступен</Bullet>
                                        <Bullet><strong>Данные профиля</strong> (по желанию): полное имя, город, уровень (грейд), навыки, краткое описание</Bullet>
                                        <Bullet><strong>Дата регистрации</strong> и статус верификации email</Bullet>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-2 print:text-black">Технические данные сессий</h3>
                                    <ul className="space-y-2">
                                        <Bullet><strong>IP-адрес</strong> — фиксируется при каждом входе в аккаунт и при использовании платформы</Bullet>
                                        <Bullet><strong>User agent</strong> — тип браузера и устройства</Bullet>
                                        <Bullet><strong>Refresh-токены сессий</strong> — технические токены для поддержания авторизации, хранятся с IP и информацией об устройстве</Bullet>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-2 print:text-black">Аналитика использования</h3>
                                    <ul className="space-y-2">
                                        <Bullet><strong>События</strong>: просмотры вакансий, поиск, применение фильтров, переходы по разделам</Bullet>
                                        <Bullet><strong>IP-адрес</strong> и <strong>user agent</strong> — привязываются к каждому аналитическому событию</Bullet>
                                        <Bullet><strong>Session ID</strong> — анонимный идентификатор сессии для группировки событий</Bullet>
                                        <Bullet><strong>Маршрут</strong> — URL страницы в момент события</Bullet>
                                    </ul>
                                    <p className="text-slate-500 text-sm mt-3 print:text-gray-500">
                                        Мы используем собственную аналитику (first-party), без передачи данных Google Analytics или другим третьим сторонам.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-2 print:text-black">Данные о вакансиях</h3>
                                    <ul className="space-y-2">
                                        <Bullet>Вакансии агрегируются из публичных источников (HH.ru). Это не персональные данные пользователей платформы</Bullet>
                                    </ul>
                                </div>
                            </div>
                        </Section>

                        <Section icon={BarChart2} iconColor="text-emerald-400" title="Как мы используем данные">
                            <ul className="space-y-2">
                                <Bullet>Авторизация и безопасность аккаунта (токены сессий, защита от брутфорса)</Bullet>
                                <Bullet>Персонализация рекомендаций вакансий на основе данных профиля</Bullet>
                                <Bullet>Улучшение поиска, фильтров и интерфейса платформы</Bullet>
                                <Bullet>Обнаружение и предотвращение злоупотреблений (rate limiting, подозрительная активность)</Bullet>
                                <Bullet>Ответы на обращения пользователей</Bullet>
                            </ul>
                            <p className="text-slate-500 text-sm mt-4 print:text-gray-500">
                                Мы не продаём, не передаём и не монетизируем ваши данные третьим лицам.
                            </p>
                        </Section>

                        <Section icon={Server} iconColor="text-orange-400" title="Хранение данных">
                            <ul className="space-y-2">
                                <Bullet><strong>Данные аккаунта</strong> — хранятся до удаления аккаунта</Bullet>
                                <Bullet><strong>Refresh-токены</strong> — автоматически истекают и удаляются; при выходе из аккаунта отзываются немедленно</Bullet>
                                <Bullet><strong>Аналитические события</strong> — хранятся без установленного срока, используются только в агрегированном виде для улучшения платформы</Bullet>
                                <Bullet><strong>Сервер</strong> — данные хранятся на серверах в России. При необходимости соблюдается законодательство РК о персональных данных</Bullet>
                            </ul>
                        </Section>

                        <Section icon={Lock} iconColor="text-green-400" title="Безопасность">
                            <ul className="space-y-2">
                                <Bullet>Пароли хранятся в виде bcrypt-хешей — исходный пароль не восстанавливается</Bullet>
                                <Bullet>Соединение защищено HTTPS (TLS)</Bullet>
                                <Bullet>Доступ к базе данных закрыт от публичной сети (только внутренняя сеть сервера)</Bullet>
                                <Bullet>Rate limiting на всех чувствительных эндпоинтах (вход, регистрация, сброс пароля)</Bullet>
                            </ul>
                            <p className="text-slate-500 text-sm mt-3 print:text-gray-500">
                                Ни один способ передачи данных через интернет не даёт 100% гарантии. При обнаружении уязвимости — сообщите нам.
                            </p>
                        </Section>

                        <Section icon={UserCheck} iconColor="text-cyan-400" title="Ваши права">
                            <ul className="space-y-3">
                                <Bullet>
                                    <strong>Просмотр данных</strong> — вы можете увидеть данные профиля в разделе «Профиль»
                                </Bullet>
                                <Bullet>
                                    <strong>Редактирование</strong> — имя, город, грейд, навыки и bio можно изменить в любой момент
                                </Bullet>
                                <Bullet>
                                    <strong>Изменение пароля</strong> — доступно в настройках безопасности
                                </Bullet>
                                <Bullet>
                                    <strong>Удаление аккаунта</strong> — напишите нам на почту, мы удалим аккаунт и связанные данные в течение 7 рабочих дней
                                </Bullet>
                            </ul>
                        </Section>

                        <Section icon={Eye} title="Сторонние сервисы">
                            <ul className="space-y-2">
                                <Bullet>
                                    <strong>HH.ru</strong> — вакансии агрегируются через публичный API. При нажатии «Откликнуться» вы переходите на сайт HH.ru — их политика конфиденциальности применяется независимо от нашей
                                </Bullet>
                                <Bullet>
                                    <strong>Google Fonts и devicon CDN</strong> — используются для загрузки шрифтов и иконок технологий. Эти сервисы могут фиксировать ваш IP при загрузке ресурсов
                                </Bullet>
                            </ul>
                        </Section>

                        <section className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-500/30 rounded-2xl p-6 print:border-gray-300 print:rounded-none print:bg-white">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 print:text-black">
                                <Mail className="text-violet-400 print:hidden" size={20} />
                                Контакт
                            </h2>
                            <p className="text-slate-300 leading-relaxed mb-4 print:text-black">
                                Вопросы по политике конфиденциальности, запросы на удаление данных и сообщения об уязвимостях:
                            </p>
                            <a
                                href="mailto:info@gitjob.su"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors print:text-black print:bg-transparent print:p-0"
                            >
                                <Mail size={16} className="print:hidden" />
                                info@gitjob.su
                            </a>
                            <p className="text-slate-500 text-sm mt-4 print:text-gray-500">
                                Мы оставляем за собой право обновлять данную политику. При существенных изменениях — уведомление появится на сайте.
                            </p>
                        </section>

                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default PrivacyPage;
