import { GetServerSideProps } from "next";
import { FC } from "react";
import Podcast from "podcast";
import { escape } from "html-escaper";

interface Post {
  status: string;
  post_metas: {
    podcast: {
      episode: string;
      audioUrl: any;
      fileSize: any;
      duration: string;
    };
  };
  title: { rendered: any };
  content: { rendered: any };
  id: any;
  date: string | number | Date;
}

const RSS: FC = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (res) {
    const year = new Date().getFullYear();
    const feed = new Podcast({
      title: "已知未知 Known Unknowns",
      description:
        "已知未知是一档聚焦生活、科技与职业的非定期更新播客。信息过载的时代，我们从已知探索未知。",
      feed_url: "https://kukfm.com/rss",
      site_url: "http://kukfm.com",
      image_url: "https://static.ouorz.com/kuk_podcast_logo.jpg",
      author: "TonyHe",
      copyright: `${year} TonyHe`,
      language: "zh-cn",
      pubDate: "May 20, 2012 04:00:00 GMT",
      ttl: "60",
      itunesAuthor: "TonyHe",
      itunesSummary:
        "已知未知是一档聚焦生活、科技与职业的非定期更新播客。信息过载的时代，我们从已知探索未知。",
      itunesOwner: { name: "TonyHe", email: "tony.hlp@hotmail.com" },
      itunesExplicit: false,
      itunesCategory: [
        {
          text: "Society & Culture",
          subcats: [
            {
              text: "Personal Journals",
            },
          ],
        },
      ],
      itunesImage: "https://static.ouorz.com/kuk_podcast_logo.jpg",
    });

    const response = await fetch(
      "https://blog.ouorz.com/wp-json/wp/v2/posts?&categories=120&per_page=20"
    );

    const episodes = await response.json();

    episodes.forEach((post: Post) => {
      if (post.status == "publish") {
        feed.addItem({
          title: `EP${post.post_metas.podcast.episode}: ${post.title.rendered}`,
          description: post.content.rendered,
          url: `https://kukfm.com/episode/${post.id}`,
          date: new Date(post.date),
          enclosure: {
            url: post.post_metas.podcast.audioUrl,
            size: post.post_metas.podcast.fileSize,
          },
          itunesExplicit: false,
          itunesSummary: escape(post.content.rendered),
          itunesDuration: parseInt(post.post_metas.podcast.duration),
          itunesEpisode: parseInt(post.post_metas.podcast.episode),
          itunesEpisodeType: "full",
          itunesImage: "https://static.ouorz.com/kuk_podcast_logo.jpg",
        });
      }
    });

    res.setHeader("Content-Type", "text/xml");
    res.write(feed.buildXml());
    res.end();
  }

  return {
    props: {},
  };
};

export default RSS;
