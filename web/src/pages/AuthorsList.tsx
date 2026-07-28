import React, { useEffect, useState } from 'react';
import { publicService, getFullUrl } from '../services/api';
import type { Author } from '../services/api';
import { Mail, ArrowRight, Info } from 'lucide-react';
import { Link, useLoaderData, useNavigation } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { Skeleton } from 'antd';

export async function loader() {
  try {
    const res = await publicService.getAuthors();
    return res.data || [];
  } catch (err) {
    return [];
  }
}

export const AuthorsList: React.FC = () => {
  const { t } = useLanguage();
  const authors = useLoaderData() as Author[];
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('meet_the_authors')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
          {t('authors_desc')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton.Avatar active size={64} shape="circle" />
                <div className="flex-1">
                  <Skeleton active paragraph={{ rows: 1, width: '60%' }} title={{ width: '80%' }} />
                </div>
              </div>
              <Skeleton active paragraph={{ rows: 2 }} title={false} />
            </div>
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="py-16 text-center glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl bg-white/40 dark:bg-slate-900/30">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_authors')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <div
              key={author.id}
              className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white/40 dark:bg-slate-900/30 group"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full border-2 border-accentBlue/20 overflow-hidden flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-950/40">
                    {author.avatar_url ? (
                      <img
                        src={getFullUrl(author.avatar_url)}
                        alt={author.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="font-bold text-accentBlue text-xl">
                        {author.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-slate-850 dark:text-white truncate">
                      {author.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 mr-1 shrink-0" />
                      <span className="truncate">{author.email}</span>
                    </div>
                  </div>
                </div>

                {/* Author Bio */}
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 min-h-[60px]">
                  {author.bio || t('no_bio')}
                </p>
              </div>

              {/* View Profile Action */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/40 mt-6 flex justify-end">
                <Link
                  to={`/authors/${author.nickname}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors group/btn"
                >
                  <span>{t('view_articles')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div>
        <Skeleton active paragraph={false} title={{ width: '30%' }} />
        <Skeleton active paragraph={{ rows: 2, width: ['100%', '65%'] }} title={false} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton.Avatar active size={64} shape="circle" />
              <div className="flex-1">
                <Skeleton active paragraph={{ rows: 1, width: '60%' }} title={{ width: '80%' }} />
              </div>
            </div>
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuthorsList;
