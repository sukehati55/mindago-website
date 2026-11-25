const {test}=require('node:test');
const assert=require('node:assert/strict');
const rule=require('../integrations/cloudflare-canonical-redirect.json');
test('reviewed Cloudflare redirect contract is exact-host, permanent and query preserving',()=>{
  assert.equal(rule.expression,'(http.host eq "www.mindago.my") or (http.host eq "mindago.my" and http.request.scheme eq "http")');
  assert.equal(rule.action_parameters.from_value.status_code,301);
  assert.equal(rule.action_parameters.from_value.preserve_query_string,true);
  assert.equal(rule.action_parameters.from_value.target_url.expression,'concat("https://mindago.my", http.request.uri.path)');
});
for(const input of ['http://www.mindago.my/','https://www.mindago.my/books/?utm_source=review&x=a%2Fb',
  'http://mindago.my/teaching-resources/free-sample/?x=1']) test('redirect intention: '+input,()=>{
  const url=new URL(input);const target=new URL('https://mindago.my'+url.pathname+url.search);
  assert.equal(target.hostname,'mindago.my');assert.equal(target.search,url.search);assert.equal(target.pathname,url.pathname);
  assert.equal(target.protocol,'https:');
  assert.equal(target.hostname==='www.mindago.my'||target.protocol==='http:',false);
});
test('HTTPS apex, signup and protected Playroom are outside the redirect match',()=>{
  for(const input of ['https://mindago.my/','https://join.mindago.my/founding50','https://play.mindago.my/']){
    const u=new URL(input);
    assert.equal(u.hostname==='www.mindago.my'||(u.hostname==='mindago.my'&&u.protocol==='http:'),false);
  }
});
