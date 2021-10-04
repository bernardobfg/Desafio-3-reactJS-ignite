import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { ReactNode } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactNode {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <span>Carregando...</span>;
  }
  const wordsPerMinutes = 200;
  const calcTime = (): number => {
    const numberOfWords = post.data.content.reduce((acc, next) => {
      const total_heading = next.heading.split(' ').length;
      const total_body = next.body.reduce((acc_body, next_body) => {
        return acc_body + next_body.text.split(' ').length;
      }, 0);
      return acc + total_body + total_heading;
    }, 0);
    return Math.ceil(numberOfWords / wordsPerMinutes);
  };
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <div className={commonStyles.container}>
        <Header />
        <main className={styles.container}>
          <img src={post.data.banner.url} alt={post.data.title} />
          <article>
            <h1 className={commonStyles.heading}>{post.data.title}</h1>
            <div className={`${commonStyles.info} ${styles.info}`}>
              <span>
                <FiCalendar />
                <p>
                  {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                    locale: ptBR,
                  })}
                </p>
              </span>
              <span>
                <FiUser />
                <p>{post.data.author}</p>
              </span>
              <span>
                <FiClock />
                <p>{calcTime()} min</p>
              </span>
            </div>
            <div className={`${styles.content} `}>
              {post.data.content.map((content, index) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index}>
                    <h2 className={commonStyles.heading}>{content.heading}</h2>
                    <div
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(content.body),
                      }}
                      className={`${styles.body} ${commonStyles.body}`}
                    />
                  </div>
                );
              })}
            </div>
          </article>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
    }
  );
  const paths = posts.results.map(result => ({
    params: {
      slug: result.uid,
    },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content,
      subtitle: response.data.subtitle,
    },
  };
  return {
    props: {
      post,
    },
    redirect: 60 * 30,
  };
};
