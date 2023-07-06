import classes from './main.module.css'
import { useState, useEffect } from 'react';
import Island from './Island';
import { string2island, island2String } from '@/utils/islandParser/islandParser';
import islands from './data/islands.json';
import { IM_Fell_English_SC as Font } from 'next/font/google';
import Link from 'next/link';

const font = Font({
  subsets: ['latin'],
  weight: ['400']
});

const hostname = 'https://sunkenatlas.com';

export default function Main({islandString='', loading}) {

  const copyLabels = ['Copy', 'Copied'];
  const testDirty = () => editString !== islandString;

  const [copyLabel, setCopyLabel] = useState(copyLabels[0]);
  const [editString, setEditString] = useState(islandString);
  const [pageDirty, setPageDirty] = useState(testDirty());
  const tiles = string2island(editString);
  const link = `${hostname}/i/${editString}`;
  
  const confirmClose = (e) => {
    if (pageDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  useEffect(() => {
    setPageDirty(testDirty());
  }, [editString, islandString]);

  useEffect(() => {
    window.addEventListener('beforeunload', confirmClose);
    return () => {
      window.removeEventListener('beforeunload', confirmClose);
    }
  },[]);

  useEffect(() => {
    setEditString(islandString);
  }, [islandString]);

  useEffect(() => {
    setCopyLabel(copyLabels[0]);
  }, [editString]);

  const selectMe = (e) => {
    e.target.select();
  };

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopyLabel(copyLabels[1]);
  }

  const toggleTile = (x, y) => {
    const newTiles = [...tiles];
    newTiles[y][x] = newTiles[y][x] ? 0 : 1;
    //newIsland.name = getIslandName(editingIsland.code);
    setEditString(island2String(newTiles));
  };

  const getTileNumberWarning = () => {
    const sumTiles = tiles.reduce((length, row) => length + row.filter(cell => cell === 1).length, 0);
    const difference = 24 - sumTiles;
    const plural = (Math.abs(difference) === 1) ? '' : 's';
    if(difference > 0) {
      return `${difference} tile${plural} still to place`;
    } else if (difference < 0) {
      let diff = Math.abs(difference);
      if (diff === 1) {
        diff = 'an';
      }
      return `You've placed ${diff} extra tile${plural}!`;
    } else {
      return '';
    }
  }

  return (
    <div className={classes.wrapper}>
      <main className={classes.main}>
        <h1 className={[font.className, classes.h1].join(' ')}><Link href='/'>Sunken Atlas</Link></h1>
        <div className={classes.welcome}>the <a target='_blank' href='https://boardgamegeek.com/boardgame/65244/forbidden-island'>Forbidden Island</a> layout editor</div>
        <Island editable toggleTile={toggleTile} tiles={tiles} />
        <div className={classes.tileWarning}>{getTileNumberWarning()}</div>
        {loading && islandString ? null : (
          <>
            <h2 className={classes.h2}>Share this island</h2>
            <div className={classes.share}>
              <input className={classes.shareBox} type='text' value={link} readOnly onClick={selectMe} />
              <button className={classes.shareButton} onClick={copy}>{copyLabel}</button>
            </div>
          </>
        )}
      </main>
      <section className={classes.islands}>
        <div className={classes.islandPreviews}>
          {islands.map((island => <Island size='s' isLink={true} tiles={island.tiles} key={island.tiles} />))}
        </div>
        <p className={classes.p}>
          <em>
            Islands from <a target='_blank' href='https://boardgamegeek.com/thread/569926/official-variant-tile-layouts/page/1'>BGG</a> &amp; <a target='_blank' href='https://solidred.co.uk'>my imagination</a>. Code on <a target='_blank' href='https://github.com/user24/forbidden-island-editor/'>github</a>.
          </em>
        </p>
      </section>
    </div>
  )
}
