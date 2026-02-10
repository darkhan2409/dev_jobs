import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getGuideStage, getArtifact, GUIDE_ROLE_EXTRAS } from '../../data/guideData';

export default function GuideBreadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const path = location.pathname;

  const crumbs = [{ label: 'Карта', to: '/guide' }];

  if (params.stageId && !path.includes('/role/') && !path.includes('/artifact/')) {
    const stage = getGuideStage(params.stageId);
    if (stage) {
      crumbs.push({ label: stage.name, to: `/guide/${stage.id}` });
    }
  }

  if (params.roleId) {
    const extras = GUIDE_ROLE_EXTRAS[params.roleId];
    if (extras) {
      crumbs.push({ label: extras.classTagline, to: null });
    }
  }

  if (params.artifactId) {
    const artifact = getArtifact(params.artifactId);
    if (artifact) {
      const stage = getGuideStage(artifact.stageId);
      if (stage) {
        crumbs.push({ label: stage.name, to: `/guide/${stage.id}` });
      }
      crumbs.push({ label: artifact.nameRu, to: null });
    }
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 px-4 sm:px-6 py-3 max-w-7xl mx-auto">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={14} className="text-slate-600" />}
          {crumb.to && i < crumbs.length - 1 ? (
            <Link
              to={crumb.to}
              className="hover:text-slate-300 transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className={i === crumbs.length - 1 ? 'text-slate-300' : ''}>
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
