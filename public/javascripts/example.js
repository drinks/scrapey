run_scraper = function($, options){
  resp = {
    title: $('title').eq(0).text(),
    links: {}
  }

  $('a').each(function(){
    resp.links[$(this).text().trim()] = $(this).attr('href');
  });
  return resp;
}