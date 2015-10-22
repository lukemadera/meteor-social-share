LmSocialShare = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState(){
        let instid = (Math.random() + 1).toString(36).substring(7);
        return {instid}
    },

    getMeteorData(){
        var instid = this.state.instid;
        var types =['facebook', 'twitter', 'pinterest'];
        var shareData = this.props.shareData;
        var eles ={
          ids: []
        };
        var ii;
        for(ii =0; ii<types.length; ii++) {
          (function(ii) {
            eles.ids[types[ii]] ='socialShare'+instid+types[ii];
            setTimeout(function() {
              lmSocialShare.add(eles.ids[types[ii]], types[ii], shareData, {});
            }, 500);
          })(ii);
        }

        return {eles};
    },

    render(){
        let eles = this.data.eles;
        let opts = this.props;

        let facebook = <div id={eles.ids.facebook} className='lm-share-btn lm-facebook'>Facebook</div>
        let twitter = <div id={eles.ids.twitter} className='lm-share-btn lm-twitter'>Twitter</div>
        let pinterest = <div id={eles.ids.pinterest} className='lm-share-btn lm-pinterest'>Pinterest</div>

        return(
            <div className="lm-social-share-wr">
                {opts.facebook && facebook}
                {opts.twitter && twitter}
                {opts.pinterest && pinterest}
            </div>
        );
    }
});
