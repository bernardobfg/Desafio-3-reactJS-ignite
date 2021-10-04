import { GetStaticProps } from 'next';
import { ReactNode, useState } from 'react';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi/';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactNode {
  const [results, setResults] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const getNextPage = (): void => {
    if (nextPage) {
      fetch(nextPage)
        .then(response => response.json())
        .then(response => {
          const newResults = response?.results.map(post => {
            return {
              uid: post.uid,
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
              first_publication_date: post.first_publication_date,
            };
          });
          setResults([...results, ...newResults]);
          setNextPage(response.next_page);
        });
    }
  };
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <div className={commonStyles.container}>
        <Header />

        <div className={styles.container}>
          <main>
            <div className={styles.postList}>
              {results?.map((post: Post) => {
                return (
                  <Link href={`/post/${post.uid}`} key={post.uid}>
                    <a className={styles.postLink}>
                      <h2 className={commonStyles.heading}>
                        {post.data.title}
                      </h2>
                      <p className={commonStyles.body}>{post.data.subtitle}</p>
                      <div className={commonStyles.info}>
                        <p>
                          <FiCalendar />
                          <span>
                            {format(
                              new Date(post.first_publication_date),
                              'd MMM yyyy',
                              {
                                locale: ptBR,
                              }
                            )}
                          </span>
                        </p>
                        <p>
                          <FiUser />
                          <span>{post.data.author}</span>
                        </p>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>
            {nextPage && (
              <button
                type="button"
                onClick={getNextPage}
                className={styles.loadMore}
              >
                Carregar mais posts
              </button>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
      pageSize: 2,
    }
  );
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });
  const { next_page } = postsResponse;

  return {
    props: {
      postsPagination: { results, next_page: next_page || null },
    },
    redirect: 60 * 30,
  };
};
