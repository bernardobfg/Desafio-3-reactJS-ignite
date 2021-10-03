import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import { ReactNode } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
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
  return (
    <div className={commonStyles.container}>
      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt={post.data.title} />
        <article>
          <h1 className={commonStyles.heading}>{post.data.title}</h1>
          <div className={`${commonStyles.info} ${styles.info}`}>
            <span>
              <FiCalendar />
              <p>{post.first_publication_date}</p>
            </span>
            <span>
              <FiUser />
              <p>{post.data.author}</p>
            </span>
            <span>
              <FiClock />
              <p>5 minutos</p>
            </span>
          </div>
          <div className={`${styles.content} `}>
            {post.data.content.map((content, index) => {
              return (
                <div key={index}>
                  <h2 className={commonStyles.heading}>{content.heading}</h2>
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: content.body }}
                    className={`${styles.body} ${commonStyles.body}`}
                  />
                </div>
              );
            })}
          </div>
        </article>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query('');
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: RichText.asHtml(content.body),
        };
      }),
    },
  };
  return {
    props: {
      post,
    },
  };
};
