import { css } from "@linaria/core";

export const LoadingStyle = css`
  &.loading {
    position: relative;
    display: inline-block;
    opacity: 0;
    animation-name: fadeIn;
    animation-fill-mode: forwards;
    line-height: $height;
    width: $width;
  }

  .loading__sugar {
    display: inline-block;
    position: relative;
    vertical-align: middle;

    &:before,
    &:after {
      content: "";
      display: inline-block;
      width: $radius;
      height: $radius;
      border-radius: 50%;
      position: absolute;
    }

    &:not(:last-child) {
      margin-right: $margin;
    }

    @for $i from 1 through $total {
      $delay: $i * -$interval;

      &:nth-child(#{$i}) {
        animation-delay: $delay;

        &:before {
          animation: animBefore $duration $loading-cublic-bezier infinite;
          animation-delay: $delay;
          background-color: $blue;
        }

        &:after {
          animation: animAfter $duration $loading-cublic-bezier infinite;
          animation-delay: $delay;
          background-color: $green;
        }
      }
    }
  }

  @keyframes animBefore {
    0% {
      transform: translate3d(0, $negative-top, 1px);
    }

    25% {
      transform: scale(#{$max-scale}), translateZ(1px);
    }

    50% {
      transform: translate3d(0, $top, -1px);
    }

    75% {
      background-color: $blue-t90;
      transform: scale(#{$min-scale}), translateZ(-1px);
    }

    100% {
      transform: translate3d(0, $negative-top, -1px);
    }
  }

  @keyframes animAfter {
    0% {
      transform: translate3d(0, $top, -1px);
    }

    25% {
      background-color: $green-t90;
      transform: scale(#{$min-scale}), translateZ(-1px);
    }

    50% {
      transform: translate3d(0, $negative-top, 1px);
    }

    75% {
      transform: scale(#{$max-scale}), translateZ(1px);
    }

    100% {
      transform: translate3d(0, $top, 1px);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;
