declare module "google-trends-api" {
  interface TrendsOptions {
    keyword: string;
    geo?: string;
    startTime?: Date;
    endTime?: Date;
  }

  function interestOverTime(options: TrendsOptions): Promise<string>;
  function relatedQueries(options: TrendsOptions): Promise<string>;

  const googleTrends: {
    interestOverTime: typeof interestOverTime;
    relatedQueries: typeof relatedQueries;
  };

  export default googleTrends;
}
