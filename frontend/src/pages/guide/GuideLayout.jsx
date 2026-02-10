import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GuideBreadcrumbs from '../../components/guide/GuideBreadcrumbs';
import MiniPipelineBar from '../../components/guide/MiniPipelineBar';
import { pageVariants } from '../../utils/animations';

export default function GuideLayout() {
  const location = useLocation();
  const isRoot = location.pathname === '/guide';

  return (
    <>
      <GuideBreadcrumbs />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={!isRoot ? 'pb-24' : undefined}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {!isRoot && <MiniPipelineBar />}
    </>
  );
}
