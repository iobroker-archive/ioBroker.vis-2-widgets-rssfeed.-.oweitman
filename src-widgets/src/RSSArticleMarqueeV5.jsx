/* eslint-disable class-methods-use-this */
import React from 'react';
import { Link, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Marquee from 'react-fast-marquee';
import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';

const rssExample = require('./rss.json');

/* globals vis */

class RSSArticleMarqueeV5 extends (window.visRxWidget || VisRxWidget) {
    constructor(props) {
        super(props);
        this.state.showDialog = false;
        this.state.iframeSrc = '';
    }
    static getWidgetInfo() {
        return {
            id: 'tplRSSArticleMarqueeV5',
            visSet: 'vis-2-widgets-rssfeed',
            visName: 'RSSFeed Article Marquee v5', // Name of widget
            visAttrs: [
                {
                    name: 'common', // group name
                    fields: [
                        {
                            name: 'count', // name in data structure
                            type: 'number',
                            default: 1,
                            min: 1,
                            max: Number.MAX_VALUE,
                            step: 1,
                            label: 'vis_2_widgets_rssfeed_marquee_count', // translated field label
                            onChange: async (field, data, changeData) => {
                                const { count } = data;
                                for (let i = 0; i <= count; i++) {
                                    data[`g_feeds-${i}`] = true;
                                }
                                changeData(data);
                            },
                        },
                        {
                            name: 'speed', // name in data structure
                            type: 'number',
                            default: 200,
                            min: 1,
                            max: Number.MAX_VALUE,
                            step: 1,
                            label: 'vis_2_widgets_rssfeed_marquee_speed', // translated field label
                        },
                        {
                            name: 'divider', // name in data structure
                            type: 'text',
                            default: '+++',
                            label: 'vis_2_widgets_rssfeed_marquee_divider', // translated field label
                        },
                        {
                            name: 'pauseonhover', // name in data structure
                            type: 'checkbox',
                            default: true,
                            label: 'vis_2_widgets_rssfeed_marquee_pauseonhover', // translated field label
                        },
                        {
                            name: 'opentype', // name in data structure
                            type: 'select',
                            options: ['none', 'link', 'popup'],
                            default: 'none',
                            label: 'vis_2_widgets_rssfeed_marquee_opentype', // translated field label
                        },
                        {
                            name: 'withtime', // name in data structure
                            type: 'checkbox',
                            default: false,
                            label: 'vis_2_widgets_rssfeed_marquee_withtime', // translated field label
                        },
                        {
                            name: 'withdate', // name in data structure
                            type: 'checkbox',
                            default: false,
                            label: 'vis_2_widgets_rssfeed_marquee_withdate', // translated field label
                        },
                        {
                            name: 'withyear', // name in data structure
                            type: 'checkbox',
                            default: false,
                            label: 'vis_2_widgets_rssfeed_marquee_withyear', // translated field label
                        },
                        {
                            name: 'withname', // name in data structure
                            type: 'checkbox',
                            default: false,
                            label: 'vis_2_widgets_rssfeed_marquee_withname', // translated field label
                        },
                    ],
                },
                {
                    name: 'feeds', // group name
                    label: 'vis_2_widgets_rssfeed_marquee_feedsgroup', // translated group label
                    indexFrom: 1,
                    indexTo: 'count',
                    onChange: async (field, data, changeData) => {
                        changeData(data);
                    },
                    fields: [
                        {
                            name: 'feed-oid', // name in data structure
                            type: 'id',
                            label: 'vis_2_widgets_rssfeed_marquee_oid', // translated field label
                        },
                        {
                            name: 'feed-name', // name in data structure
                            type: 'text',
                            label: 'vis_2_widgets_rssfeed_marquee_name', // translated field label
                        },
                        {
                            name: 'feed-maxarticles', // name in data structure
                            type: 'number',
                            default: 1,
                            min: 1,
                            max: Number.MAX_VALUE,
                            step: 1,
                            label: 'vis_2_widgets_rssfeed_marquee_maxarticles', // translated field label
                        },
                        {
                            name: 'feed-filter', // name in data structure
                            type: 'text',
                            label: 'vis_2_widgets_rssfeed_marquee_filter', // translated field label
                        },
                    ],
                },
                // check here all possible types https://github.com/ioBroker/ioBroker.vis/blob/react/src/src/Attributes/Widget/SCHEMA.md
            ],
            visDefaultStyle: {
                // default style
                width: 300,
                height: 26,
            },
            visPrev: '',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    propertiesUpdate() {
        // Widget has 3 important states
        // 1. this.state.values - contains all state values, that are used in widget (automatically collected from widget info).
        //                        So you can use `this.state.values[this.state.rxData.oid + '.val']` to get value of state with id this.state.rxData.oid
        // 2. this.state.rxData - contains all widget data with replaced bindings. E.g. if this.state.data.type is `{system.adapter.admin.0.alive}`,
        //                        then this.state.rxData.type will have state value of `system.adapter.admin.0.alive`
        // 3. this.state.rxStyle - contains all widget styles with replaced bindings. E.g. if this.state.styles.width is `{javascript.0.width}px`,
        //                        then this.state.rxData.type will have state value of `javascript.0.width` + 'px
    }

    componentDidMount() {
        super.componentDidMount();

        // Update data
        this.propertiesUpdate();
    }

    // Do not delete this method. It is used by vis to read the widget configuration.
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return RSSArticleMarqueeV5.getWidgetInfo();
    }

    // This function is called every time when rxData is changed
    onRxDataChanged() {
        this.propertiesUpdate();
    }

    // This function is called every time when rxStyle is changed
    // eslint-disable-next-line class-methods-use-this
    onRxStyleChanged() {}

    // This function is called every time when some Object State updated, but all changes lands into this.state.values too
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    onStateUpdated(id, state) {}

    checkFilter(value, filters, sep) {
        sep = typeof sep !== 'undefined' ? sep : ';';
        const filter = filters.split(sep);
        return filter.reduce((acc, cur) => {
            if (cur === '') return acc;
            return acc || value.toLowerCase().indexOf(cur.toLowerCase()) >= 0;
        }, false);
    }

    renderTitle(data, item) {
        let time = [];
        if (data.withDate) time.push(vis.formatDate(item.date, 'DD.MM.'));
        if (data.withYear) time.push(vis.formatDate(item.date, 'YY'));
        time = [time.join('')];
        if (data.withTime) time.push(vis.formatDate(item.date, 'hh:mm'));

        return ` ${data.divider} ${time.join(' ')} ${data.withName ? `${item.meta_name || item.meta_title}: ` : ''} ${
            item.title
        } `;
    }
    handleClick(link) {
        this.setState({ showDialog: true });
        this.setState({ iframeSrc: link });
    }
    handleClose() {
        this.setState({ showDialog: false });
        this.setState({ iframeSrc: '' });
    }
    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        let data = {
            speed: this.state.rxData.speed || 200,
            divider: this.state.rxData.divider || '',
            pauseonhover: this.state.rxData.pauseonhover ? true : this.state.rxData.pauseonhover,
            opentype: this.state.rxData.opentype,
            withTime: this.state.rxData.withtime ? this.state.rxData.withtime : false,
            withDate: this.state.rxData.withdate ? this.state.rxData.withdate : false,
            withYear: this.state.rxData.withyear ? this.state.rxData.withyear : false,
            withName: this.state.rxData.withname ? this.state.rxData.withname : false,
        };

        const keys = Object.keys(this.state.data).filter((key) => /g_feeds-(\d+)/gm.test(key));
        const articles = keys.reduce((acc, key) => {
            if (key === 'g_feeds-0') return acc;
            const id = /g_feeds-(\d+)/gm.exec(key)[1];
            const rss = JSON.parse(
                this.state.values[`${this.state.data[`feed-oid${id}`]}.val`] || JSON.stringify(rssExample),
            );
            if (!Object.prototype.hasOwnProperty.call(rss, 'articles')) return acc;
            const maxarticles = this.state.data[`feed-maxarticles${id}`] || 5;
            const filter = this.state.data[`feed-filter${id}`];
            const name = this.state.data[`feed-name${id}`];
            if (rss && rss.articles && rss.articles.length > maxarticles)
                rss.articles = rss.articles.slice(0, maxarticles);
            rss.articles = rss.articles.map((item) => ({
                title: item.title,
                description: item.description,
                categories: item.categories,
                date: item.date,
                link: item.link,
                meta_description: rss.meta.description,
                meta_name: name,
                meta_title: rss.meta.title,
                key: key + item.title,
            }));
            if (filter) {
                rss.articles = rss.articles.filter((item) =>
                    this.checkFilter(item.title + item.description + item.categories.toString(), filter),
                );
            }
            return acc.concat(rss.articles);
        }, []);
        articles.sort((aEl, bEl) => new Date(bEl.date) - new Date(aEl.date));

        if (data.opentype === 'link') {
            return (
                <Marquee pauseOnHover={data.pauseonhover} speed={data.speed}>
                    <div>
                        {articles.map((item) => {
                            return (
                                <Link
                                    key={item.title}
                                    href={item.link}
                                    underline="hover"
                                    color="inherit"
                                    target="_blank"
                                >
                                    {this.renderTitle(data, item)}
                                </Link>
                            );
                        })}
                    </div>
                </Marquee>
            );
        } else if (data.opentype === 'popup') {
            const classesDialog = `dialog ${this.props.id}`;
            const classesiFrame = `iframe ${this.props.id}`;
            return (
                <>
                    <Marquee pauseOnHover={data.pauseonhover} speed={data.speed}>
                        <div>
                            {articles.map((item) => {
                                return (
                                    <span
                                        style={{ cursor: 'pointer' }}
                                        key={item.key}
                                        link={item.link}
                                        onClick={() => {
                                            this.handleClick(item.link);
                                        }}
                                    >
                                        {this.renderTitle(data, item)}
                                    </span>
                                );
                            })}
                        </div>
                    </Marquee>
                    <Dialog
                        className={classesDialog}
                        PaperProps={{
                            sx: {
                                width: '90%',
                                height: '90%',
                                overflow: 'hidden',
                                maxHeight: 'inherit',
                                maxWidth: 'inherit',
                            },
                        }}
                        open={this.state.showDialog}
                        onClose={() => {}}
                    >
                        <IconButton
                            aria-label="close"
                            onClick={() => this.handleClose()}
                            sx={(theme) => ({
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'black',
                                backgroundColor: 'red',
                            })}
                        >
                            <CloseIcon />
                        </IconButton>
                        <iframe
                            className={classesiFrame}
                            src={this.state.iframeSrc}
                            title="popup"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </Dialog>
                </>
            );
            /*             <Dialog open={this.state.showDialog} onClose={() => {}} />;
            <Dialog open={true} onClose={() => {}} />; */
        } else {
            return (
                <Marquee pauseOnHover={data.pauseonhover} speed={data.speed}>
                    <div>
                        {articles.map((item) => {
                            return <span key={item.key}>{this.renderTitle(data, item)}</span>;
                        })}
                    </div>
                </Marquee>
            );
        }
    }
}

export default RSSArticleMarqueeV5;

/*
container
    position: relative;
    border: 1px solid #ccc;
    overflow: hidden;
slide.active
    display: contents;
slide
    position: absolute;
    display: none;

*/
