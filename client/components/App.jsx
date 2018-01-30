import React, { Component } from 'react';
import ReactDOM from 'react-dom'; 
import InfiniteScroll from 'react-infinite-scroller';
import qwest from 'qwest';  
   

const imageList = [];
const api = {
    baseUrl: 'https://www.reddit.com/' 
}; 

const display = {
  display: 'block'
};

const hide = {
  display: 'none'
};

export class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      toggle: false
    }
  }

  toggle(event) {
    this.setState(prevState => ({
      toggle: !prevState.toggle
    }));
  }

  render() {
      
    const id = this.props.id
    const title = this.props.title
    const src = this.props.src  
    const thumbnail = this.props.thumbnail  
    const permalink = api.baseUrl + this.props.permalink 
    var modal = [];
    modal.push(
      <div key={id} className="modal" style={this.state.toggle ? display : hide}>
                 <div className="modal-header">
        <span className="btn" onClick={this.toggle}>Close</span>
      </div>
      <div className="modal-content">
        <h4>{title}</h4>
        <p><img className='img-large' src={src}/></p>
        <a href={permalink}>Link</a>
      </div> 
    </div>
    );
    return (
      <div>
        <span className="previewBox" onClick={this.toggle}><img src={thumbnail}/></span>
        {modal}
      </div>
    );
  }
} 

class Grid extends React.Component {
    constructor(props) {
        super(props);            

        this.state = {
            tracks: [],
            hasMoreItems: true,
            nextAfter: null,
            KEYWORD: '',
            value: 'pics',
            message: 'Loading ...'             
        };          
        
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)  
        this.handleClick = this.handleClick.bind(this)   
    } 
    
    handleChange(event){
        this.setState({value: event.target.value})   
        this.setState({tracks: [], nextAfter: null, KEYWORD: this.state.value})  
    }
    
    handleSubmit(event) {   
         event.preventDefault()
    }    
    
    handleClick(event) {  
        this.setState({value: ''})   
    }   
      
    loadItems(page) {
             const self = this;   
             if(this.state.nextAfter) {url = this.state.nextHref;} 
             var KEYWORD = this.state.value 
             var url = api.baseUrl + `r/${KEYWORD}/top.json`;
        
               qwest.get(url, {  
                limit: 50,
                after : this.state.nextAfter
            }, {
                cache: true
            })
            .then(function(xhr, resp) {
                if(resp) {
                    var tracks = self.state.tracks;                    
                     
                    if(resp.data.children.length>0)
                        {
                                resp.data.children.map((track) => {                                  
                                var imageExtension = track.data.url.substr(track.data.url.length - 4).toUpperCase()                                     
                                 if(track.data.thumbnail!='nsfw' && (imageExtension ==".PNG" || imageExtension==".JPG" || imageExtension==".GIF"))
                                 {
                                     tracks.push(track);      
                                 }
                                });

                            if(resp.data.after) {
                                  self.setState({
                                    tracks: tracks,
                                    nextAfter: resp.data.after
                                });
                            } else {
                                self.setState({
                                    hasMoreItems: false
                                });
                            }
                        }
                    else
                        {
                            
                            this.setState({message: "Error", nextAfter: null})   
                        }
                   
                }
            }).catch(function(e, xhr, response) 
            {         
              console.log("Error");
              this.setState({message: "Error", nextAfter: null})   
            }) 
           
    }

    render() {
        const loader = <div className="loader">{this.state.tracks.length==0?"No results":"Loading..."}</div>;

        var items = [];
        this.state.tracks.map((track, i) => { 
            const constTitle = track.data.title
            const constImgSrc = track.data.url 
            const constThumbnail = track.data.thumbnail             
            const constPermalink = track.data.permalink 
            items.push(
                <div className="track" key={i}>                        
                        <Modal id={i} title={constTitle} src={constImgSrc} thumbnail={constThumbnail} permalink={constPermalink}/>                          
                    
                </div>
            );
        });

        return (
            <div>
             <div>               
                <form  onSubmit={this.handleSubmit}>
                  <label>
                    Search Keyword:
                    <input type="text" name="KEYWORD" value={this.state.value}  onChange={this.handleChange} onClick={this.handleClick}/>
                  </label> 
                </form>
            </div>
            <div>
            <InfiniteScroll
                pageStart={0}
                loadMore={this.loadItems.bind(this)}
                hasMore={this.state.hasMoreItems}
                initialLoad={true}
                loader={loader}>
                <div className="tracks">
                    {items}
                </div>
            </InfiniteScroll>
           </div>
                </div>
        );
    }
};
 
export default Grid; 

ReactDOM.render( 
    <Grid /> , document.getElementById('root'));