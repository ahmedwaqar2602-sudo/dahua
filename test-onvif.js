const onvif = require('node-onvif');
const http = require('http');

async function test() {
  let cam = new onvif.OnvifDevice({
    xaddr: 'http://192.168.50.102:80/onvif/device_service',
    user: 'admin',
    pass: 'Khan1234#'
  });

  try {
    await cam.init();
    let p = cam.getCurrentProfile();
    if (!p) return;
    
    // We can use http.request to send a manual SOAP request to the Imaging service URL.
    const imagingServiceUrl = cam.services.imaging ? cam.services.imaging.XAddr : null;
    if (!imagingServiceUrl) {
      console.log('No imaging service');
      return;
    }
    console.log('Imaging service:', imagingServiceUrl);
    
  } catch(e) {
    console.log('Init err:', e);
  }
}
test();
